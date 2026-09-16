import type { PlayerStats } from '../entities/PlayerStats.ts'

export interface ShopItemDefinition {
  id: string
  name: string
  description: string
  cost: number
  apply: (stats: PlayerStats) => void
}

export interface ShopOffer {
  definition: ShopItemDefinition
  purchased: boolean
}
