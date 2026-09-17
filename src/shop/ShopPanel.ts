import type { ShopSystem } from './ShopSystem.ts'
import { STARTER_WEAPON_TYPES, WeaponType, type WeaponType as WeaponTypeValue } from '../combat/WeaponDefinition.ts'
import { WEAPON_DEFINITIONS } from '../combat/weaponDefinitions.ts'

export class ShopPanel {
  private readonly root: HTMLElement
  private readonly shop: ShopSystem
  private readonly getMoney: () => number
  private readonly onNextRound: () => void
  private readonly unsubscribe: () => void
  private starterWeaponCallback?: (weapon: WeaponTypeValue) => void
  private roundEndNotice = ''

  constructor(
    root: HTMLElement,
    shop: ShopSystem,
    getMoney: () => number,
    onNextRound: () => void,
  ) {
    this.root = root
    this.shop = shop
    this.getMoney = getMoney
    this.onNextRound = onNextRound
    this.unsubscribe = shop.subscribe(() => this.render())
    this.root.addEventListener('click', this.onClick)
  }

  show(): void {
    this.starterWeaponCallback = undefined
    this.root.hidden = false
    this.render()
  }

  showStarterWeaponSelection(onSelect: (weapon: WeaponTypeValue) => void): void {
    this.starterWeaponCallback = onSelect
    this.root.hidden = false
    this.render()
  }

  hide(): void {
    this.root.hidden = true
    this.roundEndNotice = ''
  }

  setRoundEndNotice(notice: string): void { this.roundEndNotice = notice }

  dispose(): void {
    this.unsubscribe()
    this.root.removeEventListener('click', this.onClick)
  }

  private render(): void {
    if (this.starterWeaponCallback) {
      const descriptions: Record<string, string> = {
        [WeaponType.Pistol]: '穿透 · 均衡单发',
        [WeaponType.SMG]: '高速射击 · 高频触发',
        [WeaponType.Shotgun]: '3 发散射 · 近距击退',
      }
      this.root.innerHTML = `
        <div class="shop-panel__card">
          <header><div><span class="eyebrow">STARTER WEAPON</span><h2>选择你的武器</h2></div><strong>FREE</strong></header>
          ${this.roundEndNotice ? `<p class="shop-panel__notice">${this.roundEndNotice}</p>` : ''}
          <div class="shop-panel__offers">
            ${STARTER_WEAPON_TYPES.map((type) => `
              <button type="button" class="shop-offer" data-starter-weapon="${type}">
                <strong>${WEAPON_DEFINITIONS[type].displayName} / ${type}</strong>
                <span>${descriptions[type]}</span><em>免费装备</em>
              </button>
            `).join('')}
          </div>
        </div>`
      return
    }
    this.root.innerHTML = `
      <div class="shop-panel__card">
        <header>
          <div><span class="eyebrow">ROUND SHOP</span><h2>Choose a buff</h2></div>
          <strong>${this.getMoney()} money · 本页可购买：${this.shop.purchasesRemaining}</strong>
        </header>
        ${this.roundEndNotice ? `<p class="shop-panel__notice">${this.roundEndNotice}</p>` : ''}
        <div class="shop-panel__offers">
          ${this.shop.offers.map((offer) => `
            <button
              type="button"
              class="shop-offer"
              data-shop-item="${offer.definition.id}"
              ${offer.purchased || this.shop.purchaseLimitReached ? 'disabled' : ''}
            >
              <strong>${offer.definition.displayName} · ${offer.definition.rarity}</strong>
              ${offer.definition.description.split('\n').map((line) => `<span>${line}</span>`).join('')}
              <em>${offer.purchased ? 'Purchased' : this.shop.purchaseLimitReached ? 'Purchase limit reached' : `${offer.definition.price} money`}</em>
            </button>
          `).join('')}
        </div>
        <footer class="shop-panel__actions">
          <button type="button" class="shop-reroll" data-shop-reroll ${this.getMoney() < this.shop.rerollCost ? 'disabled' : ''}>刷新 · $${this.shop.rerollCost}</button>
          <button type="button" class="next-round" data-next-round>Next Round</button>
        </footer>
      </div>
    `
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const starterButton = target.closest<HTMLElement>('[data-starter-weapon]')
    if (starterButton?.dataset.starterWeapon && this.starterWeaponCallback) {
      this.starterWeaponCallback(starterButton.dataset.starterWeapon as WeaponTypeValue)
      return
    }
    const offerButton = target.closest<HTMLElement>('[data-shop-item]')
    if (offerButton?.dataset.shopItem) {
      this.shop.purchase(offerButton.dataset.shopItem)
      return
    }
    if (target.closest('[data-shop-reroll]')) {
      this.shop.reroll()
      return
    }
    if (target.closest('[data-next-round]')) this.onNextRound()
  }
}
