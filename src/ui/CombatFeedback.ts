export class CombatFeedback {
  private hideTimer?: number
  private readonly root: HTMLElement

  constructor(root: HTMLElement) { this.root = root }

  showDodge(): void {
    this.show('闪 · DODGE', 550)
  }

  showElementConverted(amount: number): void {
    this.show(`元素转化 +$${amount}`, 700)
  }

  showBossReward(name: string, description: string): void {
    this.show(`BOSS DEFEATED\n获得稀有强化\n${name}\n${description}`, 2800)
  }

  private show(message: string, duration: number): void {
    window.clearTimeout(this.hideTimer)
    this.root.textContent = message
    this.root.classList.remove('combat-feedback--visible')
    void this.root.offsetWidth
    this.root.classList.add('combat-feedback--visible')
    this.hideTimer = window.setTimeout(() => {
      this.root.classList.remove('combat-feedback--visible')
    }, duration)
  }

  dispose(): void {
    window.clearTimeout(this.hideTimer)
  }
}
