import type { PlayerStats } from '../entities/PlayerStats.ts'
import type { WeaponRuntime } from '../combat/WeaponRuntime.ts'

export interface ShopContext {
  stats: PlayerStats
  weapon: WeaponRuntime
  evolutionId: string
}

export interface ShopItemDefinition {
  id: string
  name: string
  description: string
  cost: number
  kind?: 'Generic' | 'WeaponUpgrade' | 'SynergyUpgrade'
  requirements?: (context: ShopContext) => boolean
  apply: (context: ShopContext) => void
}

export interface ShopOffer {
  definition: ShopItemDefinition
  purchased: boolean
}
