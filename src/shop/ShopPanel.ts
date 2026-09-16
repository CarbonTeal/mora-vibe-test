import type { ShopSystem } from './ShopSystem.ts'

export class ShopPanel {
  private readonly root: HTMLElement
  private readonly shop: ShopSystem
  private readonly getMoney: () => number
  private readonly onNextRound: () => void
  private readonly unsubscribe: () => void

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
    this.root.hidden = false
    this.render()
  }

  hide(): void {
    this.root.hidden = true
  }

  dispose(): void {
    this.unsubscribe()
    this.root.removeEventListener('click', this.onClick)
  }

  private render(): void {
    this.root.innerHTML = `
      <div class="shop-panel__card">
        <header>
          <div><span class="eyebrow">ROUND SHOP</span><h2>Choose a buff</h2></div>
          <strong>${this.getMoney()} money</strong>
        </header>
        <div class="shop-panel__offers">
          ${this.shop.offers.map((offer) => `
            <button
              type="button"
              class="shop-offer"
              data-shop-item="${offer.definition.id}"
              ${offer.purchased ? 'disabled' : ''}
            >
              <strong>${offer.definition.name}</strong>
              <span>${offer.definition.description}</span>
              <em>${offer.purchased ? 'Purchased' : `${offer.definition.cost} money`}</em>
            </button>
          `).join('')}
        </div>
        <button type="button" class="next-round" data-next-round>Next Round</button>
      </div>
    `
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const offerButton = target.closest<HTMLElement>('[data-shop-item]')
    if (offerButton?.dataset.shopItem) {
      this.shop.purchase(offerButton.dataset.shopItem)
      return
    }
    if (target.closest('[data-next-round]')) this.onNextRound()
  }
}
