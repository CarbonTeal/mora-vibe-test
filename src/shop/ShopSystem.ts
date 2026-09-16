import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { PlayerStats } from '../entities/PlayerStats.ts'
import type { Wallet } from '../economy/Wallet.ts'
import type { ShopItemDefinition, ShopOffer } from './ShopItem.ts'

type ShopListener = () => void

export class ShopSystem {
  readonly offers: ShopOffer[] = []
  private readonly catalog: readonly ShopItemDefinition[]
  private readonly wallet: Wallet
  private readonly stats: PlayerStats
  private readonly listeners = new Set<ShopListener>()

  constructor(catalog: readonly ShopItemDefinition[], wallet: Wallet, stats: PlayerStats) {
    this.catalog = catalog
    this.wallet = wallet
    this.stats = stats
  }

  subscribe(listener: ShopListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  open(): void {
    const shuffled = [...this.catalog].sort(() => Math.random() - 0.5)
    this.offers.length = 0
    this.offers.push(
      ...shuffled.slice(0, GAME_CONFIG.shop.itemCount).map((definition) => ({
        definition,
        purchased: false,
      })),
    )
    this.emitChanged()
  }

  purchase(itemId: string): boolean {
    const offer = this.offers.find((candidate) => candidate.definition.id === itemId)
    if (!offer || offer.purchased || !this.wallet.spend(offer.definition.cost)) return false
    offer.definition.apply(this.stats)
    offer.purchased = true
    this.emitChanged()
    return true
  }

  private emitChanged(): void {
    for (const listener of this.listeners) listener()
  }
}
