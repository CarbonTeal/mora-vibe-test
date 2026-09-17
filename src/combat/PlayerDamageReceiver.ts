import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { Health } from '../entities/Health.ts'
import type { PlayerStats } from '../entities/PlayerStats.ts'

export interface PlayerDamageResult {
  dodged: boolean
  appliedDamage: number
}

export class PlayerDamageReceiver {
  onDodge?: () => void
  private readonly health: Health
  private readonly stats: PlayerStats

  constructor(health: Health, stats: PlayerStats) {
    this.health = health
    this.stats = stats
  }

  receive(incomingDamage: number): PlayerDamageResult {
    if (this.health.isInvincible || incomingDamage <= 0) {
      return { dodged: false, appliedDamage: 0 }
    }

    const dodgeChance = THREE.MathUtils.clamp(
      this.stats.dodgeChance,
      0,
      GAME_CONFIG.player.dodgeChanceCap,
    )
    if (Math.random() < dodgeChance) {
      this.onDodge?.()
      return { dodged: true, appliedDamage: 0 }
    }

    const armor = Math.max(0, this.stats.armor)
    const damage = Math.max(
      0,
      incomingDamage * GAME_CONFIG.player.armorFormulaConstant /
        (GAME_CONFIG.player.armorFormulaConstant + armor),
    )
    this.health.takeDamage(damage)
    return { dodged: false, appliedDamage: damage }
  }

  update(delta: number): void {
    this.health.heal(Math.max(0, this.stats.hpRegenPerSecond) * delta)
  }
}
