export class Health {
  private maximum: number
  current: number
  isInvincible = false

  constructor(max: number) {
    this.maximum = max
    this.current = max
  }

  get max(): number {
    return this.maximum
  }

  setMax(max: number, healIncrease = false): void {
    const next = Math.max(1, max)
    const increase = next - this.maximum
    this.maximum = next
    this.current = Math.min(next, this.current + (healIncrease ? Math.max(0, increase) : 0))
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
