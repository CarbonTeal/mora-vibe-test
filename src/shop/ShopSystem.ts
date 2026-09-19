import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { PlayerStats } from '../entities/PlayerStats.ts'
import type { EvolutionTier } from '../elements/BuildState.ts'
import type { Wallet } from '../economy/Wallet.ts'
import type { WeaponRuntime } from '../combat/WeaponRuntime.ts'
import { BuffRarity, type BuffDefinition, type BuffOffer, type BuffTag } from './BuffDefinition.ts'
import { BuffRuntime } from './BuffRuntime.ts'
import { getSkillDefinition } from '../skills/SkillRegistry.ts'
import { getSkillGameplayTags } from './SkillGameplayTags.ts'
import { WeaponType } from '../combat/WeaponDefinition.ts'
import { SYNERGY_UPGRADES } from '../combat/SynergyUpgradeDefinition.ts'
import { createSynergyShopBuff } from './synergyShopBuffs.ts'

type ShopListener = () => void

export class ShopSystem {
  readonly offers: BuffOffer[] = []
  readonly buffs: BuffRuntime
  purchasesSinceLastReroll = 0
  rerollCount = 0
  private readonly catalog: readonly BuffDefinition[]
  private readonly wallet: Wallet
  private readonly weapon: WeaponRuntime
  private readonly getEvolutionId: () => string
  private readonly getRound: () => number
  private readonly getEvolutionTier: () => EvolutionTier
  private readonly listeners = new Set<ShopListener>()

  constructor(
    catalog: readonly BuffDefinition[],
    wallet: Wallet,
    stats: PlayerStats,
    weapon: WeaponRuntime,
    getEvolutionId: () => string,
    getRound: () => number,
    getEvolutionTier: () => EvolutionTier,
  ) {
    this.catalog = catalog
    this.wallet = wallet
    this.weapon = weapon
    this.getEvolutionId = getEvolutionId
    this.getRound = getRound
    this.getEvolutionTier = getEvolutionTier
    this.buffs = new BuffRuntime(stats, weapon)
  }

  subscribe(listener: ShopListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  open(): void {
    this.rerollCount = 0
    this.generateOffers()
  }

  reroll(): boolean {
    if (!this.wallet.spend(this.rerollCost)) return false
    this.rerollCount += 1
    this.generateOffers()
    return true
  }

  /** Debug-only shortcut: retains the official generation pipeline but skips the wallet charge. */
  forceReroll(): void {
    this.rerollCount += 1
    this.generateOffers()
  }

  /** Applies one eligible Rare buff without money, offer, or Shop purchase consumption. */
  grantRandomRareBuff(): BuffDefinition | undefined {
    const eligible = this.catalog.filter((definition) =>
      definition.rarity === BuffRarity.Rare && this.isEligible(definition),
    )
    if (eligible.length === 0) return undefined
    const totalWeight = eligible.reduce((sum, definition) => sum + this.getWeight(definition), 0)
    let roll = Math.random() * totalWeight
    let selected = eligible[eligible.length - 1]
    for (const definition of eligible) {
      roll -= this.getWeight(definition)
      if (roll <= 0) { selected = definition; break }
    }
    if (!this.buffs.acquire(selected)) return undefined
    this.emitChanged()
    return selected
  }

  private generateOffers(): void {
    this.purchasesSinceLastReroll = 0
    const candidates = this.synergyPoolEnabled
      ? [...this.catalog, ...SYNERGY_UPGRADES.map(createSynergyShopBuff)]
      : this.catalog
    const eligible = candidates.filter((definition) => this.isEligible(definition))
    this.offers.length = 0
    const pool = [...eligible]
    while (this.offers.length < GAME_CONFIG.shop.itemCount && pool.length > 0) {
      const totalWeight = pool.reduce((sum, definition) => sum + this.getWeight(definition), 0)
      let roll = Math.random() * totalWeight
      let index = pool.length - 1
      for (let i = 0; i < pool.length; i += 1) {
        roll -= this.getWeight(pool[i])
        if (roll <= 0) { index = i; break }
      }
      const [definition] = pool.splice(index, 1)
      this.offers.push({ definition, purchased: false })
    }
    this.emitChanged()
  }

  purchase(itemId: string): boolean {
    const offer = this.offers.find((candidate) => candidate.definition.id === itemId)
    if (!offer || offer.purchased || this.purchaseLimitReached) return false
    if (!this.buffs.canAcquire(offer.definition) || !this.wallet.spend(offer.definition.price)) return false
    if (!this.buffs.acquire(offer.definition)) return false
    offer.purchased = true
    this.purchasesSinceLastReroll += 1
    this.emitChanged()
    return true
  }

  get purchaseLimitReached(): boolean { return this.purchasesSinceLastReroll >= GAME_CONFIG.shop.maxPurchasesPerShop }
  get purchasesRemaining(): number { return Math.max(0, GAME_CONFIG.shop.maxPurchasesPerShop - this.purchasesSinceLastReroll) }
  get rerollCost(): number { return GAME_CONFIG.shop.baseRerollCost * 2 ** this.rerollCount }
  get synergyPoolEnabled(): boolean {
    return this.getRound() >= GAME_CONFIG.shop.synergyUnlockRound &&
      this.getEvolutionTier() >= 2 && this.weapon.weaponType !== WeaponType.BasicAttack
  }
  get offerSources(): readonly string[] {
    return this.offers.map((offer) => offer.definition.source ?? (offer.definition.requirements.some((requirement) => requirement.type === 'Weapon') ? 'Weapon' : 'Generic'))
  }

  getWeight(definition: BuffDefinition): number {
    const preferred = this.preferredTags
    const matches = definition.tags.filter((tag) => preferred.has(tag)).length
    const recommendationWeight = definition.weight * (1 + Math.min(2, matches) * (GAME_CONFIG.shop.recommendationMultiplier - 1))
    return definition.source === 'Synergy'
      ? recommendationWeight * GAME_CONFIG.shop.synergyOfferWeightMultiplier
      : recommendationWeight
  }

  private isEligible(definition: BuffDefinition): boolean {
    if (!this.buffs.canAcquire(definition)) return false
    const evolutionId = this.getEvolutionId()
    const evolutionTags = new Set(getSkillGameplayTags(getSkillDefinition(evolutionId)))
    return definition.requirements.every((requirement) => {
      if (requirement.type === 'Weapon') return requirement.values.includes(this.weapon.weaponType)
      if (requirement.type === 'EvolutionId') return requirement.values.includes(evolutionId)
      return requirement.values.some((value) => evolutionTags.has(value as BuffTag))
    })
  }

  private get preferredTags(): Set<BuffTag> {
    const tags = new Set(getSkillGameplayTags(getSkillDefinition(this.getEvolutionId())))
    const weaponTags: Partial<Record<WeaponType, readonly BuffTag[]>> = {
      [WeaponType.Pistol]: ['Damage', 'Range', 'Pierce'],
      [WeaponType.SMG]: ['AttackSpeed', 'Damage', 'Projectile'],
      [WeaponType.Shotgun]: ['PelletCount', 'Range', 'Knockback', 'Damage'],
    }
    for (const tag of weaponTags[this.weapon.weaponType] ?? []) tags.add(tag)
    return tags
  }

  private emitChanged(): void {
    for (const listener of this.listeners) listener()
  }
}
