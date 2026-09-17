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

interface TimedMultiplierStatus {
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
  private readonly armorBreaks = new Map<Enemy, Map<string, TimedMultiplierStatus>>()
  private readonly attackRateDowns = new Map<Enemy, Map<string, TimedMultiplierStatus>>()
  private readonly damageDowns = new Map<Enemy, Map<string, TimedMultiplierStatus>>()
  private readonly freezeBuildup = new Map<Enemy, number>()

  applyFreeze(target: Enemy, sourceId: string, buildup: number, duration: number): void {
    const total = Math.min(2, (this.freezeBuildup.get(target) ?? 0) + Math.max(0, buildup))
    if (total >= 1) {
      this.applySlow(target, `${sourceId}:freeze`, 0, duration)
      this.freezeBuildup.set(target, total - 1)
    } else {
      this.freezeBuildup.set(target, total)
    }
  }

  applyDamageOverTime(
    target: Enemy,
    sourceId: string,
    damage: number,
    duration: number,
    interval: number,
    stack = false,
    stackCap = 1,
  ): void {
    const targetStatuses = this.damageOverTime.get(target) ?? new Map<string, DamageOverTimeStatus>()
    let statusKey = sourceId
    if (stack) {
      const stackCount = [...targetStatuses.keys()].filter((key) => key.startsWith(`${sourceId}#`)).length
      statusKey = `${sourceId}#${Math.min(stackCount + 1, stackCap)}`
    }
    const existing = targetStatuses.get(statusKey)

    if (existing) {
      existing.damage = damage
      existing.interval = interval
      existing.remaining = Math.max(existing.remaining, duration)
    } else {
      targetStatuses.set(statusKey, {
        damage,
        interval,
        remaining: duration,
        tickCooldown: 0,
      })
    }
    this.damageOverTime.set(target, targetStatuses)
  }

  applyArmorBreak(target: Enemy, sourceId: string, multiplier: number, duration: number): void {
    this.applyTimedMultiplier(this.armorBreaks, target, sourceId, multiplier, duration)
  }

  applyAttackRateDown(target: Enemy, sourceId: string, multiplier: number, duration: number): void {
    this.applyTimedMultiplier(this.attackRateDowns, target, sourceId, multiplier, duration)
  }

  applyDamageDown(target: Enemy, sourceId: string, multiplier: number, duration: number): void {
    this.applyTimedMultiplier(this.damageDowns, target, sourceId, multiplier, duration)
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

    this.updateTimedMultipliers(this.armorBreaks, delta)
    this.updateTimedMultipliers(this.attackRateDowns, delta)
    this.updateTimedMultipliers(this.damageDowns, delta)

    for (const [enemy, buildup] of this.freezeBuildup) {
      if (enemy.health.isDead || buildup <= 0.01) this.freezeBuildup.delete(enemy)
      else this.freezeBuildup.set(enemy, Math.max(0, buildup - delta * 0.08))
    }

    return defeated
  }

  getDamageTakenMultiplier(enemy: Enemy): number {
    return this.maxMultiplier(this.armorBreaks.get(enemy))
  }

  getAttackRateMultiplier(enemy: Enemy): number {
    return this.minMultiplier(this.attackRateDowns.get(enemy))
  }

  getDamageOutputMultiplier(enemy: Enemy): number {
    return this.minMultiplier(this.damageDowns.get(enemy))
  }

  getMoveSpeedMultiplier(enemy: Enemy): number {
    const statuses = this.slows.get(enemy)
    if (!statuses || statuses.size === 0) return 1
    return Math.min(...[...statuses.values()].map((status) => status.multiplier))
  }

  clearEnemy(enemy: Enemy): void {
    this.damageOverTime.delete(enemy)
    this.slows.delete(enemy)
    this.armorBreaks.delete(enemy)
    this.attackRateDowns.delete(enemy)
    this.damageDowns.delete(enemy)
    this.freezeBuildup.delete(enemy)
  }

  clear(): void {
    this.damageOverTime.clear()
    this.slows.clear()
    this.armorBreaks.clear()
    this.attackRateDowns.clear()
    this.damageDowns.clear()
    this.freezeBuildup.clear()
  }

  private applyTimedMultiplier(
    store: Map<Enemy, Map<string, TimedMultiplierStatus>>,
    target: Enemy,
    sourceId: string,
    multiplier: number,
    duration: number,
  ): void {
    const statuses = store.get(target) ?? new Map<string, TimedMultiplierStatus>()
    statuses.set(sourceId, { multiplier: Math.max(0, multiplier), remaining: duration })
    store.set(target, statuses)
  }

  private updateTimedMultipliers(
    store: Map<Enemy, Map<string, TimedMultiplierStatus>>,
    delta: number,
  ): void {
    for (const [enemy, statuses] of store) {
      for (const [sourceId, status] of statuses) {
        status.remaining -= delta
        if (status.remaining <= 0 || enemy.health.isDead) statuses.delete(sourceId)
      }
      if (statuses.size === 0) store.delete(enemy)
    }
  }

  private minMultiplier(statuses?: Map<string, TimedMultiplierStatus>): number {
    return statuses?.size ? Math.min(...[...statuses.values()].map((status) => status.multiplier)) : 1
  }

  private maxMultiplier(statuses?: Map<string, TimedMultiplierStatus>): number {
    return statuses?.size ? Math.max(...[...statuses.values()].map((status) => status.multiplier)) : 1
  }
}
