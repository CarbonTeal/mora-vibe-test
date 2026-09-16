export class Health {
  readonly max: number
  current: number
  isInvincible = false

  constructor(max: number) {
    this.max = max
    this.current = max
  }

  get isDead(): boolean {
    return this.current <= 0
  }

  takeDamage(amount: number): void {
    if (this.isInvincible) return
    this.current = Math.max(0, this.current - Math.max(0, amount))
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + Math.max(0, amount))
  }
}
