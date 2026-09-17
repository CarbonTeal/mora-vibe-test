import type { WeaponType, WeaponStatKey } from '../combat/WeaponDefinition.ts'
import type { SynergyUpgradeDefinition } from '../combat/SynergyUpgradeDefinition.ts'

export const BuffRarity = { Common: 'Common', Uncommon: 'Uncommon', Rare: 'Rare' } as const
export type BuffRarity = typeof BuffRarity[keyof typeof BuffRarity]

export type BuffTag =
  | 'Damage' | 'AttackSpeed' | 'Mobility' | 'Defense' | 'Sustain'
  | 'Range' | 'Projectile' | 'Pickup' | 'Pierce' | 'PelletCount' | 'Knockback'
  | 'Status' | 'Zone' | 'Aura' | 'Orbit' | 'Beam' | 'Cone' | 'Wave' | 'PullField'

export type PlayerBuffStat = 'Damage' | 'AttackSpeed' | 'MoveSpeed' | 'MaxHP' | 'Armor' | 'Dodge' | 'HPRegen' | 'PickupRange'

export interface BuffStatModifier {
  target: 'Player' | 'Weapon'
  stat: PlayerBuffStat | WeaponStatKey
  operation: 'Add' | 'Multiply'
  value: number
  weaponType?: WeaponType
}

export interface BuffRequirement {
  type: 'Weapon' | 'EvolutionId' | 'EvolutionTag'
  values: readonly string[]
}

export interface BuffDefinition {
  id: string
  displayName: string
  description: string
  rarity: BuffRarity
  price: number
  statModifiers: readonly BuffStatModifier[]
  tags: readonly BuffTag[]
  requirements: readonly BuffRequirement[]
  weight: number
  maxStacks: number
  /** Identifies where this offer came from for UI/debugging; it does not affect combat behaviour. */
  source?: 'Generic' | 'Weapon' | 'Synergy'
  synergyUpgrade?: SynergyUpgradeDefinition
}

export interface BuffOffer { definition: BuffDefinition; purchased: boolean }
