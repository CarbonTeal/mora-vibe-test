import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { DebugActions, DebugSnapshot } from '../debug/DebugTypes.ts'
import { ElementBuildSystem } from '../elements/ElementBuildSystem.ts'
import type { ElementType } from '../elements/ElementType.ts'
import { Player } from '../entities/Player.ts'
import { Wallet } from '../economy/Wallet.ts'
import { FusionEventBus } from '../fusion/FusionEventBus.ts'
import { FusionResolver } from '../fusion/FusionResolver.ts'
import { FUSION_RECIPES } from '../fusion/fusionRecipes.ts'
import { GameState, RoundSystem } from '../rounds/RoundSystem.ts'
import { getSkillDefinition, resolveDebugSkillLoadout } from '../skills/SkillRegistry.ts'
import type { SkillDefinition } from '../skills/SkillDefinition.ts'
import { SkillRuntime } from '../skills/runtime/SkillRuntime.ts'
import { SHOP_ITEM_DEFINITIONS } from '../shop/shopItems.ts'
import { ShopPanel } from '../shop/ShopPanel.ts'
import { ShopSystem } from '../shop/ShopSystem.ts'
import { EnemySystem } from '../systems/EnemySystem.ts'
import { HudSystem, type HudElements } from '../systems/HudSystem.ts'
import { InputSystem } from '../systems/InputSystem.ts'
import { FusionFeedback, type FusionFeedbackElements } from '../ui/FusionFeedback.ts'

export interface GameUiElements {
  hud: HudElements
  fusion: FusionFeedbackElements
  shopRoot: HTMLElement
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
  private readonly build = new ElementBuildSystem(this.fusionResolver, this.fusionEvents)
  private readonly enemySystem: EnemySystem
  private readonly skillRuntime: SkillRuntime
  private readonly initialSkillDefinitions: readonly SkillDefinition[]
  private readonly hudSystem: HudSystem
  private readonly shopSystem: ShopSystem
  private readonly shopPanel: ShopPanel
  private readonly fusionFeedback: FusionFeedback
  private readonly unsubscribeFusionSkill: () => void
  private readonly unsubscribeRound: () => void
  private animationFrame = 0
  private isDisposed = false

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
    this.enemySystem = new EnemySystem(this.scene)
    this.skillRuntime = new SkillRuntime(
      this.scene,
      this.initialSkillDefinitions,
      () => this.wallet.add(GAME_CONFIG.economy.enemyKillMoney),
    )
    this.hudSystem = new HudSystem(ui.hud)
    this.shopSystem = new ShopSystem(SHOP_ITEM_DEFINITIONS, this.wallet, this.player.stats)
    this.shopPanel = new ShopPanel(
      ui.shopRoot,
      this.shopSystem,
      () => this.wallet.money,
      () => this.rounds.startNextRound(),
    )
    this.fusionFeedback = new FusionFeedback(ui.fusion, this.fusionEvents)
    this.unsubscribeFusionSkill = this.fusionEvents.subscribe((event) => {
      const definition = getSkillDefinition(event.resultSkillId)
      if (definition) this.skillRuntime.unlockDefinition(definition)
    })
    this.unsubscribeRound = this.rounds.subscribe(this.onRoundStateChanged)
    this.timer.connect(document)

    this.createEnvironment()
    this.scene.add(this.player.object)
    this.snapCameraToPlayer()
    this.resize()
    this.rounds.startRound()
    this.updateHud()
    window.addEventListener('resize', this.resize)
  }

  start(): void {
    this.animationFrame = requestAnimationFrame(this.tick)
  }

  getDebugActions(): DebugActions {
    return {
      addElement: (element: ElementType) => this.build.addElement(element),
      toggleSimultaneousMode: () => { this.build.toggleMode() },
      resetBuild: () => {
        this.build.reset()
        this.skillRuntime.resetDefinitions(this.initialSkillDefinitions)
      },
      giveXp: (amount: number) => this.player.gainExperience(amount),
      giveMoney: (amount: number) => this.wallet.add(amount),
      spawnEnemies: (count: number) => this.enemySystem.spawnMany(count, this.player.object.position),
      toggleInvincible: () => {
        this.player.health.isInvincible = !this.player.health.isInvincible
      },
      killAllEnemies: () => {
        this.skillRuntime.defeatAll(this.enemySystem.enemies, this.player)
        this.enemySystem.removeDefeated()
      },
      skipToRoundEnd: () => this.rounds.endRound(),
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
    this.shopPanel.dispose()
    this.skillRuntime.dispose()
    this.enemySystem.dispose()
    this.player.dispose()
    this.timer.dispose()
    this.renderer.dispose()
  }

  private readonly tick = (): void => {
    if (this.isDisposed) return
    this.timer.update()
    const delta = Math.min(this.timer.getDelta(), GAME_CONFIG.loop.maxDelta)
    this.rounds.update(delta)

    if (this.rounds.state === GameState.Combat && !this.player.health.isDead) {
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
      )
      this.enemySystem.removeDefeated()

      if (this.player.health.isDead) this.rounds.enterGameOver()
    }

    this.updateCamera(delta)
    this.updateHud()
    this.renderer.render(this.scene, this.camera)
    this.animationFrame = requestAnimationFrame(this.tick)
  }

  private readonly onRoundStateChanged = (state: GameState): void => {
    switch (state) {
      case GameState.Combat:
        this.shopPanel.hide()
        this.enemySystem.setDifficulty(this.rounds.getDifficulty())
        this.enemySystem.setSpawningEnabled(true)
        if (this.enemySystem.enemies.length === 0) {
          this.enemySystem.spawnInitialWave(this.player.object.position)
        }
        break
      case GameState.RoundEnd:
        this.enemySystem.setSpawningEnabled(false)
        this.skillRuntime.clearCombatState()
        this.enemySystem.clearAll()
        this.rounds.enterShop()
        break
      case GameState.Shop:
        this.shopSystem.open()
        this.shopPanel.show()
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
      elements: this.build.state.elements.history.map((entry) => entry.element),
      fusionMode: this.build.mode,
      recentFusion: recent ? `${recent.displayGlyph} ${recent.displayName}` : '',
      invincible: this.player.health.isInvincible,
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
