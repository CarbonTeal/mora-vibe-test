type ValueOf<T> = T[keyof T]

export const SkillTrigger = {
  OnAttack: 'OnAttack',
  OnHit: 'OnHit',
  OnKill: 'OnKill',
  OnTimer: 'OnTimer',
} as const
export type SkillTrigger = ValueOf<typeof SkillTrigger>

export const SkillCarrier = {
  Projectile: 'Projectile',
  Player: 'Player',
  PlayerAura: 'PlayerAura',
  Zone: 'Zone',
  EnemyStatus: 'EnemyStatus',
  Beam: 'Beam',
  Cone: 'Cone',
  Wave: 'Wave',
  HomingProjectile: 'HomingProjectile',
  Summon: 'Summon',
} as const
export type SkillCarrier = ValueOf<typeof SkillCarrier>

export const SkillForm = {
  Straight: 'Straight',
  Burst: 'Burst',
  Persistent: 'Persistent',
  Orbit: 'Orbit',
  Spread: 'Spread',
  Homing: 'Homing',
  Pierce: 'Pierce',
  Split: 'Split',
  Trail: 'Trail',
  Expand: 'Expand',
  Pulse: 'Pulse',
  PullField: 'PullField',
  Ricochet: 'Ricochet',
  Rain: 'Rain',
  DelayedEcho: 'DelayedEcho',
  BlinkProjectile: 'BlinkProjectile',
} as const
export type SkillForm = ValueOf<typeof SkillForm>

export const EffectType = {
  Damage: 'Damage',
  DamageOverTime: 'DamageOverTime',
  Slow: 'Slow',
  Knockback: 'Knockback',
  Pull: 'Pull',
  Freeze: 'Freeze',
  Heal: 'Heal',
  Burn: 'Burn',
  Poison: 'Poison',
  ArmorBreak: 'ArmorBreak',
  AttackRateDown: 'AttackRateDown',
  DamageDown: 'DamageDown',
} as const
export type EffectType = ValueOf<typeof EffectType>

export const ModifierType = {
  Pierce: 'Pierce',
  Split: 'Split',
  Radius: 'Radius',
  Duration: 'Duration',
  Speed: 'Speed',
  Chain: 'Chain',
  Range: 'Range',
  ProjectileCount: 'ProjectileCount',
  TickRate: 'TickRate',
  ScaleOverTime: 'ScaleOverTime',
  DamageMultiplier: 'DamageMultiplier',
} as const
export type ModifierType = ValueOf<typeof ModifierType>

export const SkillBehaviour = {
  Projectile: 'Projectile',
  BurstProjectile: 'BurstProjectile',
  ZoneProjectile: 'ZoneProjectile',
  Cone: 'Cone',
  Wave: 'Wave',
  Orbit: 'Orbit',
  Aura: 'Aura',
  Beam: 'Beam',
  Homing: 'Homing',
  Rain: 'Rain',
  Trail: 'Trail',
  PullField: 'PullField',
  Ricochet: 'Ricochet',
  Split: 'Split',
  DelayedEcho: 'DelayedEcho',
  Blink: 'Blink',
} as const
export type SkillBehaviour = ValueOf<typeof SkillBehaviour>

export const CostType = {
  AttackSpeedDown: 'AttackSpeedDown',
  MoveSpeedDown: 'MoveSpeedDown',
  SelfDamage: 'SelfDamage',
  DamageDown: 'DamageDown',
} as const
export type CostType = ValueOf<typeof CostType>
