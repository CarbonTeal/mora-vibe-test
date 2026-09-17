import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { DebugActions, DebugSnapshot } from '../debug/DebugTypes.ts'
import { ElementBuildSystem } from '../elements/ElementBuildSystem.ts'
import { EvolutionSystem } from '../elements/EvolutionSystem.ts'
import type { ElementDiscardChoice } from '../elements/ElementInventory.ts'
import { ELEMENT_PRESENTATION } from '../elements/ElementType.ts'
import type { ElementType } from '../elements/ElementType.ts'
import { ElementEnemy } from '../entities/ElementEnemy.ts'
import { Player } from '../entities/Player.ts'
import { Wallet } from '../economy/Wallet.ts'
import { FusionEventBus } from '../fusion/FusionEventBus.ts'
import { FusionResolver } from '../fusion/FusionResolver.ts'
import { FUSION_RECIPES } from '../fusion/fusionRecipes.ts'
import { GameState, RoundSystem } from '../rounds/RoundSystem.ts'
import { EVOLUTION_SKILL_DEFINITIONS, getSkillDefinition, resolveDebugSkillLoadout } from '../skills/SkillRegistry.ts'
import type { SkillDefinition } from '../skills/SkillDefinition.ts'
import { SkillRuntime } from '../skills/runtime/SkillRuntime.ts'
import { SHOP_ITEM_DEFINITIONS } from '../shop/shopItems.ts'
import { ShopPanel } from '../shop/ShopPanel.ts'
import { ShopSystem } from '../shop/ShopSystem.ts'
import { EnemySystem } from '../systems/EnemySystem.ts'
import { ElementCoreSystem } from '../systems/ElementCoreSystem.ts'
import { ElementEnemyDirector } from '../systems/ElementEnemyDirector.ts'
import { HudSystem, type HudElements } from '../systems/HudSystem.ts'
import { InputSystem } from '../systems/InputSystem.ts'
import { FusionFeedback, type FusionFeedbackElements } from '../ui/FusionFeedback.ts'
import { ElementSlotsPanel, type ElementSlotsElements } from '../ui/ElementSlotsPanel.ts'
import { MoneyPickupSystem } from '../systems/MoneyPickupSystem.ts'
import { CombatFeedback } from '../ui/CombatFeedback.ts'
import { RoundCombatStats } from '../debug/RoundCombatStats.ts'
import { WeaponRuntime } from '../combat/WeaponRuntime.ts'
import { WEAPON_UPGRADES } from '../combat/WeaponUpgradeDefinition.ts'
import { SYNERGY_UPGRADES } from '../combat/SynergyUpgradeDefinition.ts'

export interface GameUiElements {
  hud: HudElements
  fusion: FusionFeedbackElements
  elementSlots: ElementSlotsElements
  shopRoot: HTMLElement
  combatFeedback: HTMLElement
  startScreen: HTMLElement
}

export class Game {
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly timer = new THREE.Timer()
  private readonly player = new Player()
  private readonly wallet = new Wallet()
  private readonly input = new InputSystem()
  private readonly rounds = new RoundSystem()
  private readonly fusionEvents = new FusionEventBus()
  private readonly fusionResolver = new FusionResolver(FUSION_RECIPES, this.fusionEvents)
  private readonly build = new ElementBuildSystem(this.fusionEvents)
  private readonly evolution = new EvolutionSystem(this.build, this.fusionResolver)
  private readonly roundStats = new RoundCombatStats()
  private readonly enemySystem: EnemySystem
  private readonly elementEnemyDirector: ElementEnemyDirector
  private readonly elementCoreSystem: ElementCoreSystem
  private readonly moneyPickupSystem: MoneyPickupSystem
  private readonly skillRuntime: SkillRuntime
  private readonly weaponRuntime = new WeaponRuntime()
  private readonly initialSkillDefinitions: readonly SkillDefinition[]
  private readonly hudSystem: HudSystem
  private readonly shopSystem: ShopSystem
  private readonly shopPanel: ShopPanel
  private readonly fusionFeedback: FusionFeedback
  private readonly elementSlotsPanel: ElementSlotsPanel
  private readonly combatFeedback: CombatFeedback
  private readonly startScreen: HTMLElement
  private readonly unsubscribeFusionSkill: () => void
  private readonly unsubscribeRound: () => void
  private animationFrame = 0
  private isDisposed = false
  private debugSkillIndex = 0
  private hasSelectedStarterWeapon = false

  constructor(canvas: HTMLCanvasElement, ui: GameUiElements) {
    this.scene.background = new THREE.Color(GAME_CONFIG.arena.backgroundColor)
    this.scene.fog = new THREE.Fog(GAME_CONFIG.arena.backgroundColor, 30, 58)
    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.camera.fov,
      1,
      GAME_CONFIG.camera.near,
      GAME_CONFIG.camera.far,
    )
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.initialSkillDefinitions = resolveDebugSkillLoadout(window.location.search)
    this.enemySystem = new EnemySystem(this.scene, (enemy) => {
      this.roundStats.recordEnemySpawned()
      enemy.health.onDamage = (amount) => this.roundStats.recordDamage(amount)
    })
    this.elementEnemyDirector = new ElementEnemyDirector(this.enemySystem)
    this.elementCoreSystem = new ElementCoreSystem(this.scene, (element) => {
      const result = this.build.pickupElement(element)
      if (result === 'converted') {
        const value = GAME_CONFIG.elements.tier2ElementCoreMoneyValue
        this.wallet.add(value)
        this.combatFeedback?.showElementConverted(value)
        return true
      }
      this.elementSlotsPanel?.notifyElementPickup(element)
      return true
    })
    this.moneyPickupSystem = new MoneyPickupSystem(this.scene, {
      onManualCollected: (amount) => this.roundStats.recordManualCollection(amount),
      onRoundEndCollected: (total, collected) => this.roundStats.recordRoundEndCollection(total, collected),
    })
    this.skillRuntime = new SkillRuntime(
      this.scene,
      this.initialSkillDefinitions,
      this.weaponRuntime,
    )
    this.combatFeedback = new CombatFeedback(ui.combatFeedback)
    this.startScreen = ui.startScreen
    this.player.damageReceiver.onDodge = () => this.combatFeedback.showDodge()
    this.hudSystem = new HudSystem(ui.hud)
    this.shopSystem = new ShopSystem(
      SHOP_ITEM_DEFINITIONS,
      this.wallet,
      this.player.stats,
      this.weaponRuntime,
      () => this.build.state.currentEvolution?.id ?? '',
      () => this.rounds.currentRound,
      () => this.build.evolutionTier,
    )
    this.shopPanel = new ShopPanel(
      ui.shopRoot,
      this.shopSystem,
      () => this.wallet.money,
      () => this.rounds.startNextRound(),
    )
    this.fusionFeedback = new FusionFeedback(ui.fusion, this.fusionEvents)
    this.elementSlotsPanel = new ElementSlotsPanel(
      ui.elementSlots,
      () => this.evolveElements(),
      (choice) => this.resolveElementOverflow(choice),
    )
    this.unsubscribeFusionSkill = this.fusionEvents.subscribe((event) => {
      const definition = getSkillDefinition(event.resultSkillId)
      if (definition) {
        this.skillRuntime.setEvolutionDefinition(definition)
        this.weaponRuntime.setEvolution(definition.id)
      }
      this.player.setEvolutionColor(ELEMENT_PRESENTATION[event.inputA].color)
    })
    this.unsubscribeRound = this.rounds.subscribe(this.onRoundStateChanged)
    this.timer.connect(document)

    this.createEnvironment()
    this.scene.add(this.player.object)
    this.snapCameraToPlayer()
    this.resize()
    this.enemySystem.setSpawningEnabled(false)
    this.updateHud()
    window.addEventListener('resize', this.resize)
  }

  start(): void {
    this.animationFrame = requestAnimationFrame(this.tick)
  }

  beginRun(): void {
    this.rounds.beginRun()
  }

  getDebugActions(): DebugActions {
    return {
      spawnElementEnemy: (element: ElementType) => {
        this.elementEnemyDirector.spawnSpecific(element, this.player.object.position)
      },
      giveElementCore: (element: ElementType) => {
        this.elementCoreSystem.spawn(element, this.player.object.position)
      },
      spawnElementCore: (element: ElementType) => {
        this.elementCoreSystem.spawn(
          element,
          this.player.object.position.clone().add(new THREE.Vector3(7, 0, 0)),
        )
      },
      clearPendingElements: () => this.build.clearPendingElements(),
      clearCurrentEvolution: () => {
        this.build.clearCurrentEvolution()
        this.player.setEvolutionColor()
        this.skillRuntime.resetDefinitions(this.initialSkillDefinitions)
        this.weaponRuntime.setEvolution('')
      },
      giveXp: (amount: number) => this.player.gainExperience(amount),
      giveMoney: (amount: number) => this.wallet.add(amount),
      spawnEnemies: (count: number) => this.enemySystem.spawnMany(count, this.player.object.position),
      spawnEnemy: (archetype, eliteModifiers = []) => {
        this.enemySystem.spawnArchetype(archetype, this.player.object.position, eliteModifiers)
      },
      giveArmor: () => this.player.stats.addArmor(GAME_CONFIG.debug.armorGrant),
      giveDodge: () => this.player.stats.addDodgeChance(GAME_CONFIG.debug.dodgeGrant),
      giveHpRegen: () => this.player.stats.addHpRegen(GAME_CONFIG.debug.hpRegenGrant),
      givePickupRange: () => this.player.stats.addPickupRange(GAME_CONFIG.debug.pickupRangeGrant),
      spawnMoney: (count: number) => this.moneyPickupSystem.spawnMany(this.player.object.position, count),
      spawnUncollectedMoney: (count: number) => this.moneyPickupSystem.spawnMany(
        this.player.object.position.clone().add(new THREE.Vector3(10, 0, 0)),
        count,
      ),
      equipWeapon: (weapon) => this.weaponRuntime.equip(weapon),
      applyWeaponUpgrade: (upgradeId) => {
        const upgrade = WEAPON_UPGRADES.find((candidate) => candidate.id === upgradeId)
        if (upgrade) this.weaponRuntime.applyWeaponUpgrade(upgrade)
      },
      applySynergyUpgrade: (upgradeId) => {
        const upgrade = SYNERGY_UPGRADES.find((candidate) => candidate.id === upgradeId)
        if (upgrade) this.weaponRuntime.applySynergyUpgrade(upgrade)
      },
      triggerScheduledElementSpawn: () => {
        this.elementEnemyDirector.triggerScheduledSpawn(this.rounds.currentRound, this.player.object.position)
      },
      forceElementSpawnDelayTest: () => {
        this.rounds.setCombatElapsed(GAME_CONFIG.elements.elementEnemySpawnDelaySeconds - 1)
      },
      setRoundTimerToFive: () => this.rounds.setRemainingTime(5),
      resetEvolutionTutorial: () => this.elementSlotsPanel.resetTutorial(),
      forceRound: (round) => this.forceRoundForDebug(round),
      refreshShop: () => this.shopSystem.open(),
      forceReroll: () => this.shopSystem.forceReroll(),
      returnToStartScreen: () => this.returnToStartScreen(),
      toggleInvincible: () => {
        this.player.health.isInvincible = !this.player.health.isInvincible
      },
      killAllEnemies: () => {
        this.skillRuntime.defeatAll(this.enemySystem.enemies, this.player)
        this.handleDefeatedEnemies(this.enemySystem.removeDefeated())
      },
      skipToRoundEnd: () => this.rounds.endRound(),
      forceNextRound: () => this.forceNextRound(),
      forceEvolution: (skillId: string) => this.forceEvolution(skillId),
      nextSkill: () => this.stepDebugSkill(1),
      previousSkill: () => this.stepDebugSkill(-1),
      getSkillOptions: () => EVOLUTION_SKILL_DEFINITIONS.map(({ id, name, tier }) => ({ id, name, tier })),
      getWeaponUpgradeOptions: () => WEAPON_UPGRADES.map(({ id, name, weaponType }) => ({ id, name: `${weaponType} · ${name}` })),
      getSynergyUpgradeOptions: () => SYNERGY_UPGRADES.map(({ id, name, requirements }) => ({ id, name: `${requirements.weaponType} + ${requirements.evolutionId} · ${name}` })),
      getSnapshot: () => this.getDebugSnapshot(),
    }
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    cancelAnimationFrame(this.animationFrame)
    window.removeEventListener('resize', this.resize)
    this.unsubscribeFusionSkill()
    this.unsubscribeRound()
    this.input.dispose()
    this.build.dispose()
    this.fusionFeedback.dispose()
    this.elementSlotsPanel.dispose()
    this.shopPanel.dispose()
    this.skillRuntime.dispose()
    this.enemySystem.dispose()
    this.elementCoreSystem.dispose()
    this.moneyPickupSystem.dispose()
    this.combatFeedback.dispose()
    this.player.dispose()
    this.timer.dispose()
    this.renderer.dispose()
  }

  private readonly tick = (): void => {
    if (this.isDisposed) return
    this.timer.update()
    const delta = Math.min(this.timer.getDelta(), GAME_CONFIG.loop.maxDelta)
    const isElementChoicePaused = Boolean(this.build.state.elements.pendingElement)
    if (!isElementChoicePaused) this.rounds.update(delta)

    if (this.rounds.state === GameState.Combat && !this.player.health.isDead && !isElementChoicePaused) {
      this.elementEnemyDirector.update(this.rounds.combatElapsed, this.player.object.position)
      this.player.move(
        this.input.getMovementDirection(),
        delta,
        this.skillRuntime.getPlayerMoveSpeedMultiplier(this.player),
      )
      this.skillRuntime.update(delta, this.player, this.enemySystem.enemies)
      this.enemySystem.update(
        delta,
        this.player,
        (enemy) => this.skillRuntime.getEnemyMoveSpeedMultiplier(enemy),
        (enemy) => this.skillRuntime.getEnemyAttackRateMultiplier(enemy),
        (enemy) => this.skillRuntime.getEnemyDamageOutputMultiplier(enemy),
      )
      this.handleDefeatedEnemies(this.enemySystem.removeDefeated())
      this.moneyPickupSystem.update(delta, this.player, this.wallet)

      if (this.player.health.isDead) this.rounds.enterGameOver()
    }

    if (!isElementChoicePaused) {
      this.elementCoreSystem.update(delta, this.player, this.rounds.state === GameState.Combat)
    }

    this.updateCamera(delta)
    this.updateHud()
    this.elementSlotsPanel.render(this.build.state)
    this.renderer.render(this.scene, this.camera)
    this.animationFrame = requestAnimationFrame(this.tick)
  }

  private readonly onRoundStateChanged = (state: GameState): void => {
    switch (state) {
      case GameState.StartScreen:
        this.enemySystem.setSpawningEnabled(false)
        this.shopPanel.hide()
        this.startScreen.hidden = false
        break
      case GameState.Combat:
        this.startScreen.hidden = true
        this.resetCombatRoundState()
        this.roundStats.reset()
        this.shopPanel.hide()
        this.enemySystem.setDifficulty(this.rounds.getDifficulty())
        this.enemySystem.setRound(this.rounds.currentRound)
        this.enemySystem.setSpawningEnabled(true)
        this.elementEnemyDirector.onRoundStarted(this.rounds.currentRound)
        break
      case GameState.RoundEnd:
        this.enemySystem.setSpawningEnabled(false)
        this.skillRuntime.clearCombatState()
        this.enemySystem.clearNormalEnemies()
        if (this.build.canPickupElementCore) this.elementCoreSystem.collectAll()
        else this.elementCoreSystem.discardAll()
        const recovered = this.moneyPickupSystem.collectAtRoundEnd(
          this.wallet,
          GAME_CONFIG.economy.roundEndMoneyAutoCollectRatio,
        )
        this.shopPanel.setRoundEndNotice(recovered.total > 0 ? `未拾金币回收：+${recovered.collected}` : '')
        this.rounds.enterShop()
        break
      case GameState.Shop:
        if (this.rounds.currentRound === 1 && !this.hasSelectedStarterWeapon) {
          this.shopPanel.showStarterWeaponSelection((weapon) => {
            this.weaponRuntime.equip(weapon)
            this.hasSelectedStarterWeapon = true
            this.rounds.startNextRound()
          })
        } else {
          this.shopSystem.open()
          this.shopPanel.show()
        }
        break
      case GameState.GameOver:
        this.enemySystem.setSpawningEnabled(false)
        this.shopPanel.hide()
        break
    }
  }

  private getDebugSnapshot(): DebugSnapshot {
    const recent = this.build.state.recentFusion
    return {
      round: this.rounds.currentRound,
      state: this.rounds.state,
      remainingTime: this.rounds.remainingTime,
      money: this.wallet.money,
      level: this.player.level,
      xp: this.player.xp,
      xpForNextLevel: this.player.xpForNextLevel,
      currentEvolution: this.build.state.currentEvolution?.id ?? '',
      pending1: this.build.state.elements.pending1?.element ?? '',
      pending2: this.build.state.elements.pending2?.element ?? '',
      specialFusionAvailable: this.build.state.elements.specialFusionAvailable,
      activeElementEnemies: this.elementEnemyDirector.activeElementEnemies.map((enemy) => enemy.elementType),
      activeElementCores: this.elementCoreSystem.cores.map((core) => core.elementType),
      encounteredElements: [...this.elementEnemyDirector.spawnedElementTypes],
      recentFusion: recent ? `${recent.displayGlyph} ${recent.displayName}` : '',
      invincible: this.player.health.isInvincible,
      testerSkill: EVOLUTION_SKILL_DEFINITIONS[this.debugSkillIndex]?.id ?? '',
      runtimeObjects: this.skillRuntime.debugObjectCounts,
      playerHp: this.player.health.current,
      playerMaxHp: this.player.health.max,
      armor: this.player.stats.armor,
      dodgeChance: this.player.stats.dodgeChance,
      hpRegenPerSecond: this.player.stats.hpRegenPerSecond,
      pickupRange: this.player.stats.pickupRange,
      enemyCounts: this.enemySystem.countsByArchetype,
      enemyProjectileCount: this.enemySystem.enemyProjectiles.projectiles.length,
      moneyPickupCount: this.moneyPickupSystem.pickups.length,
      currentWeapon: this.weaponRuntime.weaponType,
      weaponStats: this.formatWeaponStats(),
      evolutionBehaviour: this.getCurrentEvolutionBehaviour(),
      activeSynergies: this.weaponRuntime.synergy.activeSummary,
      spawnedElements: [...this.elementEnemyDirector.spawnedElementTypes],
      ownedBuffs: this.shopSystem.buffs.ownedSummary,
      damageMultiplier: this.player.stats.damageMultiplier,
      attackSpeedMultiplier: this.player.stats.attackSpeedMultiplier,
      moveSpeedMultiplier: this.player.stats.moveSpeedMultiplier,
      combatElapsed: this.rounds.combatElapsed,
      roundDuration: this.rounds.roundDuration,
      elementSpawnScheduled: this.elementEnemyDirector.isSpawnScheduled,
      elementSpawnTriggered: this.elementEnemyDirector.hasTriggeredThisRound,
      evolutionTutorialShown: this.elementSlotsPanel.hasShownEvolutionTutorial,
      queuedElementCoreCount: this.build.queuedElementCoreCount,
      evolutionTier: this.build.evolutionTier,
      elementPickupLocked: !this.build.canPickupElementCore,
      synergyPoolEnabled: this.shopSystem.synergyPoolEnabled,
      shopOfferSources: this.shopSystem.offerSources,
      rerollCount: this.shopSystem.rerollCount,
      rerollCost: this.shopSystem.rerollCost,
      purchasesSinceLastReroll: this.shopSystem.purchasesSinceLastReroll,
      elementCoreMode: this.build.elementCoreMode,
      tier2ElementCoreMoneyValue: GAME_CONFIG.elements.tier2ElementCoreMoneyValue,
      roundStats: {
        ...this.roundStats.current,
        killRate: this.roundStats.killRate,
        moneyEarned: this.roundStats.moneyEarned,
      },
    }
  }

  private evolveElements(): void {
    if (this.rounds.state !== GameState.Combat) return
    this.elementSlotsPanel.dismissTutorial()
    this.evolution.evolve()
  }

  private resolveElementOverflow(choice: ElementDiscardChoice): void {
    this.build.resolveOverflow(choice)
  }

  private forceNextRound(): void {
    if (this.rounds.state === GameState.Combat) {
      this.rounds.endRound()
      return
    }
    if (this.rounds.state === GameState.Shop && (this.rounds.currentRound !== 1 || this.hasSelectedStarterWeapon)) {
      this.rounds.startNextRound()
    }
  }

  private forceRoundForDebug(round: number): void {
    this.rounds.forceRound(round)
    this.enemySystem.setDifficulty(this.rounds.getDifficulty())
    this.enemySystem.setRound(this.rounds.currentRound)
    this.shopSystem.open()
  }

  /** The sole Combat-entry reset point. It deliberately leaves long-term build state intact. */
  private resetCombatRoundState(): void {
    this.input.clearMovement()
    this.player.resetCombatPosition()
    this.snapCameraToPlayer()
    this.skillRuntime.clearCombatState()
    this.enemySystem.clearAll()
  }

  private returnToStartScreen(): void {
    this.enemySystem.setSpawningEnabled(false)
    this.rounds.returnToStartScreen()
  }

  private forceEvolution(skillId: string): void {
    const definition = getSkillDefinition(skillId)
    if (!definition || definition.id === 'basic-projectile') return
    const index = EVOLUTION_SKILL_DEFINITIONS.findIndex((candidate) => candidate.id === skillId)
    if (index >= 0) this.debugSkillIndex = index
    this.build.forceEvolution(definition)
    this.skillRuntime.setEvolutionDefinition(definition)
    this.weaponRuntime.setEvolution(definition.id)
    this.player.setEvolutionColor(definition.visual.color)
  }

  private stepDebugSkill(direction: number): void {
    const count = EVOLUTION_SKILL_DEFINITIONS.length
    this.debugSkillIndex = (this.debugSkillIndex + direction + count) % count
    this.forceEvolution(EVOLUTION_SKILL_DEFINITIONS[this.debugSkillIndex].id)
  }

  private handleDefeatedEnemies(defeated: readonly import('../entities/Enemy.ts').Enemy[]): void {
    for (const enemy of defeated) {
      if (enemy instanceof ElementEnemy) {
        this.skillRuntime.finalizeSpecialDefeat(enemy, this.player, true)
      }
      this.roundStats.recordEnemyKilled(enemy)
      this.moneyPickupSystem.spawn(enemy.object.position, enemy.moneyReward)
      this.roundStats.recordMoneySpawned(enemy.moneyReward)
      if (enemy instanceof ElementEnemy) {
        this.elementCoreSystem.spawn(enemy.elementType, enemy.object.position)
      }
    }
  }

  private updateHud(): void {
    this.hudSystem.update(
      this.player,
      this.enemySystem.enemies,
      this.skillRuntime.activeSkillNames,
      this.rounds,
      this.wallet,
    )
  }

  private formatWeaponStats(): string {
    const stats = this.weaponRuntime.stats
    return `DMG ${stats.damage.toFixed(1)} | INT ${stats.attackInterval.toFixed(2)} | RNG ${stats.range.toFixed(1)} | COUNT ${stats.projectileCount} | SPREAD ${stats.spread.toFixed(2)} | PIERCE ${stats.pierce}`
  }

  private getCurrentEvolutionBehaviour(): string {
    const id = this.build.state.currentEvolution?.id
    return id ? (getSkillDefinition(id)?.behaviour ?? getSkillDefinition(id)?.form ?? 'Unknown') : 'Basic Projectile'
  }

  private createEnvironment(): void {
    const arenaSize = GAME_CONFIG.arena.halfSize * 2
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(arenaSize, arenaSize),
      new THREE.MeshStandardMaterial({ color: GAME_CONFIG.arena.groundColor, roughness: 0.95 }),
    )
    ground.name = 'Ground'
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    const grid = new THREE.GridHelper(
      arenaSize,
      arenaSize,
      GAME_CONFIG.arena.gridColor,
      GAME_CONFIG.arena.gridColor,
    )
    grid.position.y = 0.01
    const gridMaterial = grid.material
    if (Array.isArray(gridMaterial)) {
      for (const material of gridMaterial) {
        material.opacity = 0.22
        material.transparent = true
      }
    } else {
      gridMaterial.opacity = 0.22
      gridMaterial.transparent = true
    }
    this.scene.add(grid)

    const hemisphereLight = new THREE.HemisphereLight(0xb9e8ff, 0x17222a, 2.4)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
    keyLight.position.set(8, 16, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -20
    keyLight.shadow.camera.right = 20
    keyLight.shadow.camera.top = 20
    keyLight.shadow.camera.bottom = -20
    this.scene.add(hemisphereLight, keyLight)
  }

  private snapCameraToPlayer(): void {
    this.camera.position.copy(this.getDesiredCameraPosition())
    this.camera.lookAt(this.player.object.position)
  }

  private updateCamera(delta: number): void {
    const followAmount = 1 - Math.exp(-GAME_CONFIG.camera.followSharpness * delta)
    this.camera.position.lerp(this.getDesiredCameraPosition(), followAmount)
    this.camera.lookAt(this.player.object.position)
  }

  private getDesiredCameraPosition(): THREE.Vector3 {
    const offset = GAME_CONFIG.camera.offset
    return this.player.object.position.clone().add(new THREE.Vector3(offset.x, offset.y, offset.z))
  }

  private readonly resize = (): void => {
    const width = this.renderer.domElement.clientWidth
    const height = this.renderer.domElement.clientHeight
    this.camera.aspect = width / Math.max(1, height)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }
}
