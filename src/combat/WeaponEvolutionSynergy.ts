import { WeaponType } from './WeaponDefinition.ts'

export const EvolutionFamily = {
  Projectile: 'Projectile',
  Zone: 'Zone',
  Independent: 'Independent',
} as const
export type EvolutionFamily = typeof EvolutionFamily[keyof typeof EvolutionFamily]

export interface WeaponEvolutionProfile {
  damageMultiplier: number
  durationMultiplier: number
  radiusMultiplier: number
  tickRateMultiplier: number
  projectileCountMultiplier: number
  perAttackProcCap: number
}

const neutral: WeaponEvolutionProfile = {
  damageMultiplier: 1,
  durationMultiplier: 1,
  radiusMultiplier: 1,
  tickRateMultiplier: 1,
  projectileCountMultiplier: 1,
  perAttackProcCap: Number.POSITIVE_INFINITY,
}

export const WEAPON_EVOLUTION_PROFILES: Record<WeaponType, Record<EvolutionFamily, WeaponEvolutionProfile>> = {
  [WeaponType.BasicAttack]: {
    [EvolutionFamily.Projectile]: { ...neutral },
    [EvolutionFamily.Zone]: { ...neutral },
    [EvolutionFamily.Independent]: { ...neutral },
  },
  [WeaponType.Pistol]: {
    [EvolutionFamily.Projectile]: { ...neutral, damageMultiplier: 1.08 },
    [EvolutionFamily.Zone]: { ...neutral, damageMultiplier: 1.12, durationMultiplier: 1.08 },
    [EvolutionFamily.Independent]: { ...neutral, damageMultiplier: 1.12, durationMultiplier: 1.08 },
  },
  [WeaponType.SMG]: {
    [EvolutionFamily.Projectile]: { ...neutral, damageMultiplier: 0.92 },
    [EvolutionFamily.Zone]: { ...neutral, damageMultiplier: 0.78, tickRateMultiplier: 0.88 },
    [EvolutionFamily.Independent]: { ...neutral, damageMultiplier: 0.78, tickRateMultiplier: 0.88 },
  },
  [WeaponType.Shotgun]: {
    [EvolutionFamily.Projectile]: { ...neutral, damageMultiplier: 0.72, perAttackProcCap: 3 },
    [EvolutionFamily.Zone]: { ...neutral, damageMultiplier: 0.58, radiusMultiplier: 0.72, durationMultiplier: 0.8, projectileCountMultiplier: 1, perAttackProcCap: 3 },
    [EvolutionFamily.Independent]: { ...neutral, damageMultiplier: 0.9, radiusMultiplier: 1.05, perAttackProcCap: 3 },
  },
}
