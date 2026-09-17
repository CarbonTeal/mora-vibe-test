export class CombatFeedback {
  private hideTimer?: number
  private readonly root: HTMLElement

  constructor(root: HTMLElement) { this.root = root }

  showDodge(): void {
    window.clearTimeout(this.hideTimer)
    this.root.textContent = '闪 · DODGE'
    this.root.classList.remove('combat-feedback--visible')
    void this.root.offsetWidth
    this.root.classList.add('combat-feedback--visible')
    this.hideTimer = window.setTimeout(() => {
      this.root.classList.remove('combat-feedback--visible')
    }, 550)
  }

  dispose(): void {
    window.clearTimeout(this.hideTimer)
  }
}
