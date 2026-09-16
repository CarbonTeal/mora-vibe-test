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
  Zone: 'Zone',
  EnemyStatus: 'EnemyStatus',
} as const
export type SkillCarrier = ValueOf<typeof SkillCarrier>

export const SkillForm = {
  Straight: 'Straight',
  Burst: 'Burst',
  Persistent: 'Persistent',
  Orbit: 'Orbit',
  Spread: 'Spread',
  Homing: 'Homing',
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
} as const
export type EffectType = ValueOf<typeof EffectType>

export const ModifierType = {
  Pierce: 'Pierce',
  Split: 'Split',
  Radius: 'Radius',
  Duration: 'Duration',
  Speed: 'Speed',
  Chain: 'Chain',
} as const
export type ModifierType = ValueOf<typeof ModifierType>

export const CostType = {
  AttackSpeedDown: 'AttackSpeedDown',
  MoveSpeedDown: 'MoveSpeedDown',
  SelfDamage: 'SelfDamage',
  DamageDown: 'DamageDown',
} as const
export type CostType = ValueOf<typeof CostType>
