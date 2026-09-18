import { EliteModifier, EnemyArchetype } from '../entities/EnemyArchetype.ts'

export const RoundSpecialType = {
  Normal: 'Normal',
  EliteRush: 'EliteRush',
  Boss: 'Boss',
} as const
export type RoundSpecialType = typeof RoundSpecialType[keyof typeof RoundSpecialType]

export interface EliteRushDefinition {
  eliteChance: number
  spawnIntervalMultiplier: number
  maxModifiers: number
  archetypeWeights: Readonly<Partial<Record<EnemyArchetype, number>>>
  modifiers: readonly EliteModifier[]
}

export interface RoundSpecialDefinition {
  type: RoundSpecialType
  eliteRush?: EliteRushDefinition
  bossId?: string
  bossWave?: {
    spawnPressureMultiplier: number
    archetypeWeights?: Readonly<Partial<Record<EnemyArchetype, number>>>
  }
}

const NORMAL_ROUND: RoundSpecialDefinition = { type: RoundSpecialType.Normal }

export const ROUND_SPECIAL_DEFINITIONS: Readonly<Record<number, RoundSpecialDefinition>> = {
  10: {
    type: RoundSpecialType.EliteRush,
    eliteRush: {
      eliteChance: 0.5,
      spawnIntervalMultiplier: 0.9,
      maxModifiers: 1,
      archetypeWeights: { Chaser: 0.7, Runner: 0.3 },
      modifiers: [EliteModifier.Fast, EliteModifier.Tanky],
    },
  },
  12: {
    type: RoundSpecialType.Boss,
    bossId: 'stone-colossus',
    bossWave: {
      spawnPressureMultiplier: 0.5,
      archetypeWeights: { Chaser: 0.55, Runner: 0.25, Shooter: 0.2 },
    },
  },
  14: {
    type: RoundSpecialType.EliteRush,
    eliteRush: {
      eliteChance: 0.65,
      spawnIntervalMultiplier: 0.78,
      maxModifiers: 2,
      archetypeWeights: { Chaser: 0.3, Runner: 0.15, Shooter: 0.3, Charger: 0.25 },
      modifiers: [EliteModifier.Fast, EliteModifier.Tanky, EliteModifier.RapidFire, EliteModifier.MultiShot],
    },
  },
  16: { type: RoundSpecialType.Boss, bossId: 'storm-core', bossWave: { spawnPressureMultiplier: 0.7 } },
  18: {
    type: RoundSpecialType.EliteRush,
    eliteRush: {
      eliteChance: 0.8,
      spawnIntervalMultiplier: 0.68,
      maxModifiers: 2,
      archetypeWeights: { Chaser: 0.15, Runner: 0.1, Shooter: 0.38, Charger: 0.37 },
      modifiers: [EliteModifier.Fast, EliteModifier.Tanky, EliteModifier.RapidFire, EliteModifier.MultiShot, EliteModifier.RadialBurst],
    },
  },
  20: { type: RoundSpecialType.Boss, bossId: 'eclipse-eye', bossWave: { spawnPressureMultiplier: 0.9 } },
}

export function getRoundSpecialDefinition(round: number): RoundSpecialDefinition {
  return ROUND_SPECIAL_DEFINITIONS[round] ?? NORMAL_ROUND
}
