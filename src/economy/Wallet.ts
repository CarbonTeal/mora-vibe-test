export class Wallet {
  private balance = 0

  get money(): number {
    return this.balance
  }

  add(amount: number): void {
    this.balance += Math.max(0, Math.floor(amount))
  }

  canAfford(amount: number): boolean {
    return this.balance >= amount
  }

  spend(amount: number): boolean {
    const cost = Math.max(0, Math.floor(amount))
    if (!this.canAfford(cost)) return false
    this.balance -= cost
    return true
  }

  clear(): void {
    this.balance = 0
  }
}
