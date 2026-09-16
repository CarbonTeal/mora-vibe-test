import type { ElementType } from '../elements/ElementType.ts'
import type { FusionMode } from '../fusion/FusionTypes.ts'
import type { GameState } from '../rounds/RoundSystem.ts'

export interface DebugSnapshot {
  round: number
  state: GameState
  remainingTime: number
  money: number
  level: number
  xp: number
  xpForNextLevel: number
  elements: readonly string[]
  fusionMode: FusionMode
  recentFusion: string
  invincible: boolean
}

export interface DebugActions {
  addElement: (element: ElementType) => void
  toggleSimultaneousMode: () => void
  resetBuild: () => void
  giveXp: (amount: number) => void
  giveMoney: (amount: number) => void
  spawnEnemies: (count: number) => void
  toggleInvincible: () => void
  killAllEnemies: () => void
  skipToRoundEnd: () => void
  getSnapshot: () => DebugSnapshot
}
