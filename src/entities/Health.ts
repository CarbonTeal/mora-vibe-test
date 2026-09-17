export class Health {
  private maximum: number
  current: number
  isInvincible = false
  onDamage?: (amount: number) => void
  private readonly damageListeners = new Set<(amount: number) => void>()

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

  subscribeDamage(listener: (amount: number) => void): () => void {
    this.damageListeners.add(listener)
    return () => this.damageListeners.delete(listener)
  }

  takeDamage(amount: number): number {
    if (this.isInvincible) return 0
    const previous = this.current
    this.current = Math.max(0, this.current - Math.max(0, amount))
    const dealt = previous - this.current
    if (dealt > 0) {
      this.onDamage?.(dealt)
      for (const listener of this.damageListeners) listener(dealt)
    }
    return dealt
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + Math.max(0, amount))
  }
}
