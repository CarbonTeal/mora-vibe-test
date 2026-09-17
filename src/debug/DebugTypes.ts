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
}

export interface DebugSkillOption { id: string; name: string; tier: number }

export interface DebugActions {
  spawnElementEnemy: (element: ElementType) => void
  giveElementCore: (element: ElementType) => void
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
  setRoundTimerToFive: () => void
  resetEvolutionTutorial: () => void
  toggleInvincible: () => void
  killAllEnemies: () => void
  skipToRoundEnd: () => void
  forceNextRound: () => void
  forceEvolution: (skillId: string) => void
  nextSkill: () => void
  previousSkill: () => void
  getSkillOptions: () => readonly DebugSkillOption[]
  getWeaponUpgradeOptions: () => readonly { id: string; name: string }[]
  getSynergyUpgradeOptions: () => readonly { id: string; name: string }[]
  getSnapshot: () => DebugSnapshot
}
