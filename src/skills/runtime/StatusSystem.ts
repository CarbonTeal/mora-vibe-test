import type { Enemy } from '../../entities/Enemy.ts'

interface DamageOverTimeStatus {
  damage: number
  interval: number
  remaining: number
  tickCooldown: number
}

interface SlowStatus {
  multiplier: number
  remaining: number
}

export interface StatusDefeat {
  enemy: Enemy
  sourceId: string
}

export class StatusSystem {
  private readonly damageOverTime = new Map<Enemy, Map<string, DamageOverTimeStatus>>()
  private readonly slows = new Map<Enemy, Map<string, SlowStatus>>()

  applyDamageOverTime(
    target: Enemy,
    sourceId: string,
    damage: number,
    duration: number,
    interval: number,
  ): void {
    const targetStatuses = this.damageOverTime.get(target) ?? new Map<string, DamageOverTimeStatus>()
    const existing = targetStatuses.get(sourceId)

    if (existing) {
      existing.damage = damage
      existing.interval = interval
      existing.remaining = Math.max(existing.remaining, duration)
    } else {
      targetStatuses.set(sourceId, {
        damage,
        interval,
        remaining: duration,
        tickCooldown: 0,
      })
    }
    this.damageOverTime.set(target, targetStatuses)
  }

  applySlow(target: Enemy, sourceId: string, multiplier: number, duration: number): void {
    const targetStatuses = this.slows.get(target) ?? new Map<string, SlowStatus>()
    targetStatuses.set(sourceId, {
      multiplier: Math.max(0, multiplier),
      remaining: duration,
    })
    this.slows.set(target, targetStatuses)
  }

  update(delta: number): StatusDefeat[] {
    const defeated: StatusDefeat[] = []

    for (const [enemy, statuses] of this.damageOverTime) {
      if (enemy.health.isDead) {
        this.clearEnemy(enemy)
        continue
      }

      for (const [sourceId, status] of statuses) {
        status.remaining -= delta
        status.tickCooldown -= delta

        if (status.tickCooldown <= 0 && status.remaining > 0) {
          const wasAlive = !enemy.health.isDead
          enemy.health.takeDamage(status.damage)
          status.tickCooldown += status.interval
          if (wasAlive && enemy.health.isDead) defeated.push({ enemy, sourceId })
        }

        if (status.remaining <= 0 || enemy.health.isDead) statuses.delete(sourceId)
      }

      if (statuses.size === 0) this.damageOverTime.delete(enemy)
    }

    for (const [enemy, statuses] of this.slows) {
      for (const [sourceId, status] of statuses) {
        status.remaining -= delta
        if (status.remaining <= 0 || enemy.health.isDead) statuses.delete(sourceId)
      }
      if (statuses.size === 0) this.slows.delete(enemy)
    }

    return defeated
  }

  getMoveSpeedMultiplier(enemy: Enemy): number {
    const statuses = this.slows.get(enemy)
    if (!statuses || statuses.size === 0) return 1
    return Math.min(...[...statuses.values()].map((status) => status.multiplier))
  }

  clearEnemy(enemy: Enemy): void {
    this.damageOverTime.delete(enemy)
    this.slows.delete(enemy)
  }

  clear(): void {
    this.damageOverTime.clear()
    this.slows.clear()
  }
}
