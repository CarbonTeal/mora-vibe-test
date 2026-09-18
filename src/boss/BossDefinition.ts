export const BossBehaviour = {
  MeleeCycle: 'MeleeCycle',
  RangedHazards: 'RangedHazards',
  FinalHybrid: 'FinalHybrid',
} as const
export type BossBehaviour = typeof BossBehaviour[keyof typeof BossBehaviour]

export interface BossDefinition {
  id: string
  name: string
  round: number
  behaviour: BossBehaviour
  hpMultiplier: number
  sizeMultiplier: number
  moveSpeedMultiplier: number
  color: number
  spawnDelay: number
  projectileInterval: number
  projectileCount: number
  radialInterval: number
  radialCount: number
  chargeInterval: number
  chargeWindup: number
  chargeDuration: number
  chargeSpeed: number
  recovery: number
  hazardInterval?: number
  hazardRadius?: number
  hazardTelegraph?: number
  hazardDamage?: number
  enrageThreshold?: number
  enrageIntervalMultiplier?: number
  enrageProjectileBonus?: number
  summonInterval?: number
  summonCount?: number
  maxActiveAdds?: number
}

export const BOSS_DEFINITIONS: readonly BossDefinition[] = [
  {
    id: 'stone-colossus', name: '岩甲巨像', round: 12, behaviour: BossBehaviour.MeleeCycle,
    hpMultiplier: 60, sizeMultiplier: 2.45, moveSpeedMultiplier: 0.78, color: 0xb89568,
    spawnDelay: 2.5, projectileInterval: 99, projectileCount: 0,
    radialInterval: 5.8, radialCount: 10, chargeInterval: 2.8, chargeWindup: 1,
    chargeDuration: 0.7, chargeSpeed: 15, recovery: 1.15,
  },
  {
    id: 'storm-core', name: '风暴核心', round: 16, behaviour: BossBehaviour.RangedHazards,
    hpMultiplier: 75, sizeMultiplier: 2.25, moveSpeedMultiplier: 0.72, color: 0x6ec8ff,
    spawnDelay: 2.5, projectileInterval: 1.25, projectileCount: 3,
    radialInterval: 5.2, radialCount: 12, chargeInterval: 99, chargeWindup: 0,
    chargeDuration: 0, chargeSpeed: 0, recovery: 0, hazardInterval: 4.5,
    hazardRadius: 2.4, hazardTelegraph: 1.25, hazardDamage: 18,
    enrageThreshold: 0.5, enrageIntervalMultiplier: 0.72, enrageProjectileBonus: 2,
  },
  {
    id: 'eclipse-eye', name: '蚀日之眼', round: 20, behaviour: BossBehaviour.FinalHybrid,
    hpMultiplier: 95, sizeMultiplier: 2.55, moveSpeedMultiplier: 0.82, color: 0x9d5cff,
    spawnDelay: 2.5, projectileInterval: 1.05, projectileCount: 3,
    radialInterval: 4.4, radialCount: 12, chargeInterval: 6.5, chargeWindup: 0.9,
    chargeDuration: 0.6, chargeSpeed: 16, recovery: 0.8,
    enrageThreshold: 0.5, enrageIntervalMultiplier: 0.68, enrageProjectileBonus: 4,
    summonInterval: 7, summonCount: 3, maxActiveAdds: 6,
  },
]

export const BOSS_BY_ID = new Map(BOSS_DEFINITIONS.map((definition) => [definition.id, definition]))
