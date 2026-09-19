import type { ElementType } from '../elements/ElementType.ts'
import type { GameState } from '../rounds/RoundSystem.ts'
import type { EliteModifier, EnemyArchetype } from '../entities/EnemyArchetype.ts'
import type { WeaponType } from '../combat/WeaponDefinition.ts'

export interface DebugSnapshot {
  round: number
  state: GameState
  remainingTime: number
  money: number
  level: number
  xp: number
  xpForNextLevel: number
  currentEvolution: string
  pending1: string
  pending2: string
  specialFusionAvailable: boolean
  activeElementEnemies: readonly string[]
  activeElementCores: readonly string[]
  encounteredElements: readonly string[]
  recentFusion: string
  invincible: boolean
  testerSkill: string
  runtimeObjects: string
  playerHp: number
  playerMaxHp: number
  armor: number
  dodgeChance: number
  hpRegenPerSecond: number
  pickupRange: number
  enemyCounts: Record<EnemyArchetype, number>
  enemyProjectileCount: number
  moneyPickupCount: number
  currentWeapon: WeaponType
  weaponStats: string
  evolutionBehaviour: string
  evolutionAttackMode: string
  weaponPrimaryFireEnabled: boolean
  weaponStatInheritance: string
  activeSynergies: readonly string[]
  spawnedElements: readonly string[]
  ownedBuffs: readonly string[]
  damageMultiplier: number
  attackSpeedMultiplier: number
  moveSpeedMultiplier: number
  combatElapsed: number
  roundDuration: number
  elementSpawnScheduled: boolean
  elementSpawnTriggered: boolean
  evolutionTutorialShown: boolean
  queuedElementCoreCount: number
  evolutionTier: 0 | 1 | 2 | 3 | 4
  elementPickupLocked: boolean
  synergyPoolEnabled: boolean
  shopOfferSources: readonly string[]
  rerollCount: number
  rerollCost: number
  purchasesSinceLastReroll: number
  elementCoreMode: 'Evolution' | 'MoneyConversion'
  tier2ElementCoreMoneyValue: number
  tier3BaseTier2: string
  tier3SpecialName: string
  tier3PrimaryBehaviour: string
  tier3SecondaryBehaviour: string
  tier3CouplingTrigger: string
  tier3RequiredElement: string
  tier3Target: string
  tier3Pending: string
  tier4BaseTier3: string
  tier4DisplayName: string
  tier4RequiredElement: string
  tier4Target: string
  tier4Pending: string
  tier4Signature: string
  roundSpecialType: string
  bossAlive: boolean
  bossHp: string
  bossPhase: string
  bossEnraged: boolean
  bossKillRewardGranted: boolean
  bossRoundRemainingTime: number
  activeNormalEnemyCount: number
  activeBossSummons: number
  eliteCount: number
  roundStats: {
    enemiesSpawned: number
    enemiesKilled: number
    killRate: number
    damageDealt: number
    moneySpawned: number
    moneyManuallyCollected: number
    moneyAutoCollected: number
    moneyLost: number
    moneyEarned: number
    elementEnemiesKilled: number
    elitesKilled: number
  }
}

export interface DebugSkillOption { id: string; name: string; tier: number }

export interface DebugActions {
  spawnElementEnemy: (element: ElementType) => void
  giveElementCore: (element: ElementType) => void
  spawnElementCore: (element: ElementType) => void
  clearPendingElements: () => void
  clearCurrentEvolution: () => void
  giveXp: (amount: number) => void
  giveMoney: (amount: number) => void
  spawnEnemies: (count: number) => void
  spawnEnemy: (archetype: EnemyArchetype, eliteModifiers?: readonly EliteModifier[]) => void
  giveArmor: () => void
  giveDodge: () => void
  giveHpRegen: () => void
  givePickupRange: () => void
  spawnMoney: (count: number) => void
  spawnUncollectedMoney: (count: number) => void
  equipWeapon: (weapon: WeaponType) => void
  applyWeaponUpgrade: (upgradeId: string) => void
  applySynergyUpgrade: (upgradeId: string) => void
  triggerScheduledElementSpawn: () => void
  forceElementSpawnDelayTest: () => void
  setRoundTimerToFive: () => void
  resetEvolutionTutorial: () => void
  forceRound: (round: number) => void
  refreshShop: () => void
  forceReroll: () => void
  toggleInvincible: () => void
  killAllEnemies: () => void
  skipToRoundEnd: () => void
  forceNextRound: () => void
  forceEvolution: (skillId: string) => void
  nextSkill: () => void
  previousSkill: () => void
  nextTier3: () => void
  previousTier3: () => void
  giveTier3Core: () => void
  giveTier4Core: () => void
  returnToStartScreen: () => void
  getSkillOptions: () => readonly DebugSkillOption[]
  getWeaponUpgradeOptions: () => readonly { id: string; name: string }[]
  getSynergyUpgradeOptions: () => readonly { id: string; name: string }[]
  getAttackModeAudit: () => readonly string[]
  getSnapshot: () => DebugSnapshot
}
