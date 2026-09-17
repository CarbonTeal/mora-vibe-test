import { WeaponType } from './WeaponDefinition.ts'

export const SynergyParameter = {
  Damage: 'Damage', Radius: 'Radius', Size: 'Size', ProjectileSpeed: 'ProjectileSpeed',
  Duration: 'Duration', TickRate: 'TickRate', StackCap: 'StackCap', StackGain: 'StackGain',
  PullStrength: 'PullStrength', FreezeDuration: 'FreezeDuration', FreezeBuildup: 'FreezeBuildup',
  OrbitSpeed: 'OrbitSpeed', ProjectileCount: 'ProjectileCount', Spread: 'Spread', Knockback: 'Knockback',
  PerAttackStatusCap: 'PerAttackStatusCap',
} as const
export type SynergyParameter = typeof SynergyParameter[keyof typeof SynergyParameter]

export type SynergyTrigger = 'Always' | 'OnHit' | 'OnMultiHit'

export interface SynergyModifier {
  parameter: SynergyParameter
  operation: 'Add' | 'Multiply'
  value: number
}

export interface SynergyUpgradeDefinition {
  id: string
  name: string
  description: string
  requirements: { weaponType: WeaponType; evolutionId: string }
  trigger: SynergyTrigger
  modifiers: readonly SynergyModifier[]
  duration?: number
  maxStacks?: number
  shopCost: number
}

const synergy = (
  evolutionId: string,
  weaponType: WeaponType,
  name: string,
  trigger: SynergyTrigger,
  modifiers: readonly SynergyModifier[],
  duration?: number,
  maxStacks = 1,
): SynergyUpgradeDefinition => ({
  id: `${weaponType.toLowerCase()}-${evolutionId}-synergy`,
  name,
  description: `${weaponType} + ${evolutionId}: ${name}`,
  requirements: { weaponType, evolutionId },
  trigger,
  modifiers,
  duration,
  maxStacks,
  shopCost: 8,
})

const P = SynergyParameter
const W = WeaponType

export const SYNERGY_UPGRADES: readonly SynergyUpgradeDefinition[] = [
  synergy('star', W.Pistol, 'Precision Flare', 'OnHit', [{ parameter: P.Damage, operation: 'Multiply', value: 1.25 }], 1.2),
  synergy('star', W.SMG, 'Accelerating Orbit', 'OnHit', [{ parameter: P.OrbitSpeed, operation: 'Multiply', value: 1.08 }], 1.5, 5),
  synergy('star', W.Shotgun, 'Wide Constellation', 'OnMultiHit', [{ parameter: P.Radius, operation: 'Multiply', value: 1.3 }, { parameter: P.Size, operation: 'Multiply', value: 1.18 }], 1.8),

  synergy('black-hole', W.Pistol, 'Focused Gravity', 'OnHit', [{ parameter: P.PullStrength, operation: 'Multiply', value: 1.35 }], 1.4),
  synergy('black-hole', W.SMG, 'Compression Cycle', 'OnHit', [{ parameter: P.TickRate, operation: 'Multiply', value: 0.9 }], 1.5, 3),
  synergy('black-hole', W.Shotgun, 'Event Horizon', 'OnMultiHit', [{ parameter: P.Radius, operation: 'Multiply', value: 1.35 }], 2),

  synergy('explosion', W.Pistol, 'Magnum Blast', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.25 }, { parameter: P.Radius, operation: 'Multiply', value: 1.2 }]),
  synergy('explosion', W.SMG, 'Micro Detonations', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 0.55 }, { parameter: P.Radius, operation: 'Multiply', value: 0.82 }]),
  synergy('explosion', W.Shotgun, 'Scatter Blast', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 0.26 }, { parameter: P.Radius, operation: 'Multiply', value: 0.7 }]),

  synergy('magma', W.Pistol, 'Hot Core', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.3 }]),
  synergy('magma', W.SMG, 'Rapid Puddles', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 0.58 }, { parameter: P.Duration, operation: 'Multiply', value: 0.8 }]),
  synergy('magma', W.Shotgun, 'Magma Scatter', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 0.42 }, { parameter: P.Radius, operation: 'Multiply', value: 0.62 }, { parameter: P.Duration, operation: 'Multiply', value: 0.75 }]),

  synergy('poison', W.Pistol, 'Concentrated Toxin', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.35 }]),
  synergy('poison', W.SMG, 'Venom Feed', 'Always', [{ parameter: P.StackGain, operation: 'Add', value: 1 }, { parameter: P.StackCap, operation: 'Add', value: 3 }]),
  synergy('poison', W.Shotgun, 'Toxic Buckshot', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 0.5 }, { parameter: P.StackCap, operation: 'Add', value: 2 }, { parameter: P.PerAttackStatusCap, operation: 'Add', value: 4 }]),

  synergy('ice', W.Pistol, 'Deep Freeze', 'Always', [{ parameter: P.FreezeDuration, operation: 'Multiply', value: 1.55 }]),
  synergy('ice', W.SMG, 'Cryo Rhythm', 'Always', [{ parameter: P.FreezeBuildup, operation: 'Multiply', value: 1.45 }]),
  synergy('ice', W.Shotgun, 'Flash Freeze', 'Always', [{ parameter: P.FreezeBuildup, operation: 'Multiply', value: 1.85 }, { parameter: P.PerAttackStatusCap, operation: 'Add', value: 5 }]),
]
