import { ElementType, type ElementType as ElementValue } from '../elements/ElementType.ts'
import type { DebugActions } from './DebugTypes.ts'
import { EliteModifier, EnemyArchetype } from '../entities/EnemyArchetype.ts'
import { WeaponType } from '../combat/WeaponDefinition.ts'

export class DebugPanel {
  private readonly root: HTMLElement
  private readonly actions: DebugActions
  private animationFrame = 0

  constructor(root: HTMLElement, actions: DebugActions) {
    this.root = root
    this.actions = actions
    const skillOptions = actions.getSkillOptions()
    const weaponUpgrades = actions.getWeaponUpgradeOptions()
    const synergyUpgrades = actions.getSynergyUpgradeOptions()
    const attackModeAudit = actions.getAttackModeAudit()
    this.root.innerHTML = `
      <div class="debug-panel__header">DEBUG</div>
      <pre class="debug-panel__state" data-debug-state></pre>
      <div class="debug-panel__group">
        <button type="button" data-action="return-start">Return to Start Screen</button>
      </div>
      <div class="debug-panel__group">
        <strong>FORCE EVOLUTION (6 T1 + 45 T2 + 45 T3 + 6 T4 POC)</strong>
        <select data-skill-select>
          ${skillOptions.map((skill) => `<option value="${skill.id}">T${skill.tier} · ${skill.name}</option>`).join('')}
        </select>
        <div class="debug-panel__group--grid">
          <button type="button" data-action="previous-skill">Previous Skill</button>
          <button type="button" data-action="next-skill">Next Skill</button>
          <button type="button" data-action="previous-tier3">Previous Tier3</button>
          <button type="button" data-action="next-tier3">Next Tier3</button>
        </div>
      </div>
      <div class="debug-panel__group">
        ${Object.values(ElementType).map((element) => `
          <button type="button" data-spawn-element="${element}">Spawn ${element} Element Enemy</button>
        `).join('')}
      </div>
      <div class="debug-panel__group">
        <button type="button" data-core="Fire">Spawn Fire Core</button>
        <button type="button" data-core="Earth">Spawn Earth Core</button>
        <button type="button" data-core="Water">Spawn Water Core</button>
        <button type="button" data-ground-core="Fire">Spawn Fire ElementCore</button>
        <button type="button" data-force-tier="element-fire">Force Tier1 Fire</button>
        <button type="button" data-force-tier="explosion">Force Tier2 Explosion</button>
        <button type="button" data-force-tier="star">Force Tier2 Star</button>
        <button type="button" data-action="clear-pending">Clear Pending Elements</button>
        <button type="button" data-action="clear-evolution">Clear Current Evolution</button>
      </div>
      <div class="debug-panel__group debug-panel__group--grid">
        <button type="button" data-action="xp">Give 100 XP</button>
        <button type="button" data-action="money">Give 100 Money</button>
        <button type="button" data-action="spawn-10">Spawn 10 Enemies</button>
        <button type="button" data-action="spawn-50">Spawn 50 Enemies</button>
        <button type="button" data-action="invincible">Toggle Invincible</button>
        <button type="button" data-action="kill-all">Kill All Enemies</button>
        <button type="button" data-action="skip-round">Skip To Round End</button>
        <button type="button" data-action="force-next">Force Next Round</button>
      </div>
      <div class="debug-panel__group debug-panel__group--grid">
        <button type="button" data-action="chaser">Spawn Chaser</button>
        <button type="button" data-action="runner">Spawn Runner</button>
        <button type="button" data-action="shooter">Spawn Shooter</button>
        <button type="button" data-action="charger">Spawn Charger</button>
        <button type="button" data-action="elite-shooter">Spawn Elite Shooter</button>
        <button type="button" data-action="elite-charger">Spawn Elite Charger</button>
        <button type="button" data-action="elite-chaser">Spawn Elite Chaser</button>
        <button type="button" data-action="radial-elite">Spawn RadialBurst Elite</button>
        <button type="button" data-action="armor">Give Armor</button>
        <button type="button" data-action="dodge">Give Dodge</button>
        <button type="button" data-action="regen">Give HP Regen</button>
        <button type="button" data-action="pickup-range">Give Pickup Range</button>
        <button type="button" data-action="spawn-money">Spawn 20 Money</button>
        <button type="button" data-action="spawn-money-near-10">Spawn nearby MoneyPickup ×10</button>
        <button type="button" data-action="spawn-money-10">Spawn uncollected MoneyPickup ×10</button>
        <button type="button" data-action="spawn-money-7">Spawn uncollected MoneyPickup ×7</button>
        <button type="button" data-action="timer-5">Set Round Timer to 5 sec</button>
        <button type="button" data-action="reset-evolution-tutorial">Reset Evolution Tutorial</button>
        <button type="button" data-action="force-round-6">Force Round 6</button>
        <button type="button" data-action="refresh-shop">Refresh Shop</button>
        <button type="button" data-action="force-reroll">Force Reroll</button>
      </div>
      <div class="debug-panel__group">
        <strong>WEAPON</strong>
        <div class="debug-panel__group--grid">
          <button type="button" data-weapon="Pistol">Equip Pistol</button>
          <button type="button" data-weapon="SMG">Equip SMG</button>
          <button type="button" data-weapon="Shotgun">Equip Shotgun</button>
          <button type="button" data-quick-upgrade="damage">+ Damage</button>
          <button type="button" data-quick-upgrade="attack-speed">+ AttackSpeed</button>
          <button type="button" data-quick-upgrade="range">+ Range</button>
          <button type="button" data-quick-upgrade="pierce">+ Pierce</button>
          <button type="button" data-quick-upgrade="pellet-count">+ PelletCount</button>
        </div>
        <select data-weapon-upgrade-select>${weaponUpgrades.map((item) => `<option value="${item.id}">${item.name}</option>`).join('')}</select>
        <button type="button" data-action="apply-weapon-upgrade">Apply Weapon Upgrade</button>
        <select data-synergy-select>${synergyUpgrades.map((item) => `<option value="${item.id}">${item.name}</option>`).join('')}</select>
        <button type="button" data-action="apply-synergy">Apply Synergy Upgrade</button>
      </div>
      <div class="debug-panel__group debug-panel__group--grid">
        <button type="button" data-action="trigger-element-schedule">Trigger Tier3 / Scheduled Element Spawn</button>
        <button type="button" data-action="element-delay-test">Force Element Spawn Delay test</button>
        <button type="button" data-action="force-round-9">Force Round9</button>
        <button type="button" data-action="give-tier3-core">Give Tier3 Evolution Core</button>
        <button type="button" data-action="give-tier4-core">Give Tier4 Evolution Core</button>
      </div>
      <div class="debug-panel__group debug-panel__group--grid">
        ${[2, 5, 10, 12, 14, 16, 18, 20].map((round) => `<button type="button" data-force-round="${round}">Force Round ${round}</button>`).join('')}
      </div>
      <details class="debug-panel__group">
        <summary>ATTACK MODE AUDIT · 45 T2 + 45 T3</summary>
        <pre>${attackModeAudit.join('\n')}</pre>
      </details>
    `
    this.root.addEventListener('click', this.onClick)
    this.root.addEventListener('change', this.onChange)
    this.animationFrame = requestAnimationFrame(this.render)
  }

  dispose(): void {
    cancelAnimationFrame(this.animationFrame)
    this.root.removeEventListener('click', this.onClick)
    this.root.removeEventListener('change', this.onChange)
  }

  private readonly render = (): void => {
    const state = this.actions.getSnapshot()
    const output = this.root.querySelector<HTMLElement>('[data-debug-state]')
    if (output) {
      output.textContent = [
        `Round: ${state.round}`,
        `State: ${state.state}`,
        `Time: ${state.remainingTime.toFixed(1)}s`,
        `Money: ${state.money}`,
        `Level / XP: ${state.level} / ${state.xp} / ${state.xpForNextLevel}`,
        `Invincible: ${state.invincible ? 'ON' : 'OFF'}`,
        `Current Evolution: ${state.currentEvolution || 'None'}`,
        `Evolution Tier: ${state.evolutionTier}`,
        `Element Pickup: ${state.elementPickupLocked ? 'LOCKED' : 'ENABLED'}`,
        `Pending Elements: ${[state.pending1, state.pending2].filter(Boolean).join(' + ') || 'Empty'}`,
        `Pending 1: ${state.pending1 || 'Empty'}`,
        `Pending 2: ${state.pending2 || 'Empty'}`,
        `Special Fusion Available: ${state.specialFusionAvailable ? 'YES' : 'NO'}`,
        `Active Element Enemies: ${state.activeElementEnemies.join(', ') || 'None'}`,
        `Active Element Cores: ${state.activeElementCores.join(', ') || 'None'}`,
        `Encountered Elements: ${state.encounteredElements.join(', ') || 'None'}`,
        `Last Fusion: ${state.recentFusion || 'None'}`,
        `Tester Skill: ${state.testerSkill || 'None'}`,
        `Runtime Objects: ${state.runtimeObjects}`,
        `Player HP: ${Math.ceil(state.playerHp)} / ${Math.ceil(state.playerMaxHp)}`,
        `Armor: ${state.armor.toFixed(1)}`,
        `Dodge: ${(state.dodgeChance * 100).toFixed(0)}%`,
        `HP Regen: ${state.hpRegenPerSecond.toFixed(1)}/s`,
        `Pickup Range: ${state.pickupRange.toFixed(1)}`,
        `Enemies: C${state.enemyCounts.Chaser} R${state.enemyCounts.Runner} S${state.enemyCounts.Shooter} Cg${state.enemyCounts.Charger}`,
        `Enemy Projectiles: ${state.enemyProjectileCount}`,
        `Money Pickups: ${state.moneyPickupCount}`,
        `Current Weapon: ${state.currentWeapon}`,
        `Weapon: ${state.weaponStats}`,
        `Evolution Behaviour: ${state.evolutionBehaviour}`,
        `Evolution AttackMode: ${state.evolutionAttackMode || 'None'}`,
        `Weapon Primary Fire: ${state.weaponPrimaryFireEnabled ? 'ENABLED' : 'SUPPRESSED'}`,
        `Weapon Stat Inheritance: ${state.weaponStatInheritance || 'None'}`,
        `Active Synergy: ${state.activeSynergies.join(', ') || 'None'}`,
        `Spawned Elements: ${state.spawnedElements.join(', ') || 'None'}`,
        `Owned Buffs: ${state.ownedBuffs.join(', ') || 'None'}`,
        `Final Multipliers: DMG ${state.damageMultiplier.toFixed(2)} | AS ${state.attackSpeedMultiplier.toFixed(2)} | MOVE ${state.moveSpeedMultiplier.toFixed(2)}`,
        `Combat Elapsed: ${state.combatElapsed.toFixed(1)} / ${state.roundDuration.toFixed(1)}s`,
        `Element Spawn Scheduled: ${state.elementSpawnScheduled ? 'YES' : 'NO'}`,
        `Element Spawn Triggered: ${state.elementSpawnTriggered ? 'YES' : 'NO'}`,
        `Tier3 Spawn Triggered: ${state.tier3Target ? 'YES' : 'NO'}`,
        `Evolution Tutorial Shown: ${state.evolutionTutorialShown ? 'YES' : 'NO'}`,
        `Queued Element Cores: ${state.queuedElementCoreCount}`,
        `Synergy Pool Enabled: ${state.synergyPoolEnabled ? 'YES' : 'NO'}`,
        `Shop Offer Sources: ${state.shopOfferSources.join(' | ') || 'None'}`,
        `Reroll Count: ${state.rerollCount}`,
        `Reroll Cost: $${state.rerollCost}`,
        `Purchases Since Reroll: ${state.purchasesSinceLastReroll}`,
        `ElementCore Mode: ${state.elementCoreMode}`,
        `Tier2 Core Value: $${state.tier2ElementCoreMoneyValue}`,
        `Tier3 Base: ${state.tier3BaseTier2 || 'None'}`,
        `Tier3 Special: ${state.tier3SpecialName || 'None'}`,
        `Tier3 Primary: ${state.tier3PrimaryBehaviour || 'None'}`,
        `Tier3 Secondary: ${state.tier3SecondaryBehaviour || 'None'}`,
        `Tier3 Coupling: ${state.tier3CouplingTrigger || 'None'}`,
        `Tier3 Required: ${state.tier3RequiredElement || 'None'}`,
        `Tier3 Target: ${state.tier3Target || 'None'}`,
        `Tier3 Pending: ${state.tier3Pending || 'None'}`,
        `Tier4 Base: ${state.tier4BaseTier3 || 'None'}`,
        `Tier4 Name: ${state.tier4DisplayName || 'None'}`,
        `Tier4 Required: ${state.tier4RequiredElement || 'None'}`,
        `Tier4 Target: ${state.tier4Target || 'None'}`,
        `Tier4 Pending: ${state.tier4Pending || 'None'}`,
        `Tier4 Signature: ${state.tier4Signature || 'None'}`,
        `Round Special: ${state.roundSpecialType}`,
        `Boss Alive: ${state.bossAlive ? 'YES' : 'NO'}`,
        `Boss HP: ${state.bossHp}`,
        `Boss Phase: ${state.bossPhase}${state.bossEnraged ? ' (ENRAGED)' : ''}`,
        `Boss Kill Reward Granted: ${state.bossKillRewardGranted ? 'YES' : 'NO'}`,
        `Boss Round Remaining: ${state.bossRoundRemainingTime.toFixed(1)}s`,
        `Active Normal Enemies: ${state.activeNormalEnemyCount}`,
        `Active Boss Summons: ${state.activeBossSummons}`,
        `Elite Count: ${state.eliteCount}`,
        '',
        'ROUND STATS',
        `Enemies Spawned: ${state.roundStats.enemiesSpawned}`,
        `Enemies Killed: ${state.roundStats.enemiesKilled}`,
        `Kill Rate: ${(state.roundStats.killRate * 100).toFixed(0)}%`,
        `Damage Dealt: ${Math.round(state.roundStats.damageDealt)}`,
        `Money Spawned: ${state.roundStats.moneySpawned}`,
        `Money Manually Collected: ${state.roundStats.moneyManuallyCollected}`,
        `Money Auto Collected: ${state.roundStats.moneyAutoCollected}`,
        `Money Lost: ${state.roundStats.moneyLost}`,
        `Money Earned This Round: ${state.roundStats.moneyEarned}`,
        `Element Enemies Killed: ${state.roundStats.elementEnemiesKilled}`,
        `Elites Killed: ${state.roundStats.elitesKilled}`,
        `Current Wallet: ${state.money}`,
      ].join('\n')
    }
    const select = this.root.querySelector<HTMLSelectElement>('[data-skill-select]')
    if (select && select.value !== state.testerSkill) select.value = state.testerSkill
    this.animationFrame = requestAnimationFrame(this.render)
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const spawnElement = target.dataset.spawnElement as ElementValue | undefined
    if (spawnElement) {
      this.actions.spawnElementEnemy(spawnElement)
      return
    }
    const core = target.dataset.core as ElementValue | undefined
    if (core) { this.actions.giveElementCore(core); return }
    const groundCore = target.dataset.groundCore as ElementValue | undefined
    if (groundCore) { this.actions.spawnElementCore(groundCore); return }
    const forceTier = target.dataset.forceTier
    if (forceTier) { this.actions.forceEvolution(forceTier); return }
    const forceRound = Number(target.dataset.forceRound)
    if (Number.isFinite(forceRound) && forceRound > 0) { this.actions.forceRound(forceRound); return }
    const weapon = target.dataset.weapon as typeof WeaponType[keyof typeof WeaponType] | undefined
    if (weapon) { this.actions.equipWeapon(weapon); return }
    const quickUpgrade = target.dataset.quickUpgrade
    if (quickUpgrade) {
      const currentWeapon = this.actions.getSnapshot().currentWeapon.toLowerCase()
      const id = quickUpgrade === 'pierce'
        ? 'pistol-pierce'
        : quickUpgrade === 'pellet-count'
          ? 'shotgun-pellet-count'
          : `${currentWeapon}-${quickUpgrade}`
      this.actions.applyWeaponUpgrade(id)
      return
    }

    switch (target.dataset.action) {
      case 'clear-pending': this.actions.clearPendingElements(); break
      case 'clear-evolution': this.actions.clearCurrentEvolution(); break
      case 'xp': this.actions.giveXp(100); break
      case 'money': this.actions.giveMoney(100); break
      case 'spawn-10': this.actions.spawnEnemies(10); break
      case 'spawn-50': this.actions.spawnEnemies(50); break
      case 'invincible': this.actions.toggleInvincible(); break
      case 'kill-all': this.actions.killAllEnemies(); break
      case 'skip-round': this.actions.skipToRoundEnd(); break
      case 'force-next': this.actions.forceNextRound(); break
      case 'previous-skill': this.actions.previousSkill(); break
      case 'next-skill': this.actions.nextSkill(); break
      case 'previous-tier3': this.actions.previousTier3(); break
      case 'next-tier3': this.actions.nextTier3(); break
      case 'runner': this.actions.spawnEnemy(EnemyArchetype.Runner); break
      case 'chaser': this.actions.spawnEnemy(EnemyArchetype.Chaser); break
      case 'shooter': this.actions.spawnEnemy(EnemyArchetype.Shooter); break
      case 'charger': this.actions.spawnEnemy(EnemyArchetype.Charger); break
      case 'elite-shooter': this.actions.spawnEnemy(EnemyArchetype.Shooter, [EliteModifier.MultiShot, EliteModifier.RapidFire]); break
      case 'elite-charger': this.actions.spawnEnemy(EnemyArchetype.Charger, [EliteModifier.Fast]); break
      case 'elite-chaser': this.actions.spawnEnemy(EnemyArchetype.Chaser, [EliteModifier.Tanky]); break
      case 'radial-elite': this.actions.spawnEnemy(EnemyArchetype.Chaser, [EliteModifier.RadialBurst, EliteModifier.Tanky]); break
      case 'armor': this.actions.giveArmor(); break
      case 'dodge': this.actions.giveDodge(); break
      case 'regen': this.actions.giveHpRegen(); break
      case 'pickup-range': this.actions.givePickupRange(); break
      case 'spawn-money': this.actions.spawnMoney(20); break
      case 'spawn-money-near-10': this.actions.spawnMoney(10); break
      case 'spawn-money-10': this.actions.spawnUncollectedMoney(10); break
      case 'spawn-money-7': this.actions.spawnUncollectedMoney(7); break
      case 'timer-5': this.actions.setRoundTimerToFive(); break
      case 'reset-evolution-tutorial': this.actions.resetEvolutionTutorial(); break
      case 'force-round-6': this.actions.forceRound(6); break
      case 'force-round-9': this.actions.forceRound(9); break
      case 'give-tier3-core': this.actions.giveTier3Core(); break
      case 'give-tier4-core': this.actions.giveTier4Core(); break
      case 'refresh-shop': this.actions.refreshShop(); break
      case 'force-reroll': this.actions.forceReroll(); break
      case 'return-start': this.actions.returnToStartScreen(); break
      case 'apply-weapon-upgrade': {
        const select = this.root.querySelector<HTMLSelectElement>('[data-weapon-upgrade-select]')
        if (select) this.actions.applyWeaponUpgrade(select.value)
        break
      }
      case 'apply-synergy': {
        const select = this.root.querySelector<HTMLSelectElement>('[data-synergy-select]')
        if (select) this.actions.applySynergyUpgrade(select.value)
        break
      }
      case 'trigger-element-schedule': this.actions.triggerScheduledElementSpawn(); break
      case 'element-delay-test': this.actions.forceElementSpawnDelayTest(); break
    }
  }

  private readonly onChange = (event: Event): void => {
    const target = event.target
    if (target instanceof HTMLSelectElement && target.matches('[data-skill-select]')) {
      this.actions.forceEvolution(target.value)
    }
  }
}
