import type { Enemy } from '../entities/Enemy.ts'

export interface RoundCombatSnapshot {
  enemiesSpawned: number
  enemiesKilled: number
  damageDealt: number
  moneySpawned: number
  moneyManuallyCollected: number
  moneyAutoCollected: number
  moneyLost: number
  elementEnemiesKilled: number
  elitesKilled: number
}

/** Debug-only accounting for the active combat round. */
export class RoundCombatStats {
  private snapshot: RoundCombatSnapshot = this.empty()

  reset(): void { this.snapshot = this.empty() }
  recordEnemySpawned(): void { this.snapshot.enemiesSpawned += 1 }
  recordDamage(amount: number): void { this.snapshot.damageDealt += Math.max(0, amount) }

  recordEnemyKilled(enemy: Enemy): void {
    this.snapshot.enemiesKilled += 1
    if (enemy.isSpecialEnemy) this.snapshot.elementEnemiesKilled += 1
    if (enemy.isElite) this.snapshot.elitesKilled += 1
  }

  recordMoneySpawned(amount: number): void { this.snapshot.moneySpawned += Math.max(0, amount) }
  recordManualCollection(amount: number): void { this.snapshot.moneyManuallyCollected += Math.max(0, amount) }

  recordRoundEndCollection(total: number, collected: number): void {
    this.snapshot.moneyAutoCollected += Math.max(0, collected)
    this.snapshot.moneyLost += Math.max(0, total - collected)
  }

  get current(): Readonly<RoundCombatSnapshot> { return this.snapshot }
  get killRate(): number { return this.snapshot.enemiesSpawned <= 0 ? 0 : this.snapshot.enemiesKilled / this.snapshot.enemiesSpawned }
  get moneyEarned(): number { return this.snapshot.moneyManuallyCollected + this.snapshot.moneyAutoCollected }

  private empty(): RoundCombatSnapshot {
    return {
      enemiesSpawned: 0,
      enemiesKilled: 0,
      damageDealt: 0,
      moneySpawned: 0,
      moneyManuallyCollected: 0,
      moneyAutoCollected: 0,
      moneyLost: 0,
      elementEnemiesKilled: 0,
      elitesKilled: 0,
    }
  }
}
