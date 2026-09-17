import { GAME_CONFIG } from '../config/gameConfig.ts'

export class PlayerStats {
  maxHP: number = GAME_CONFIG.player.maxHp
  armor: number = GAME_CONFIG.player.armor
  dodgeChance: number = GAME_CONFIG.player.dodgeChance
  hpRegenPerSecond: number = GAME_CONFIG.player.hpRegenPerSecond
  pickupRange: number = GAME_CONFIG.player.pickupRange
  damageMultiplier = 1
  attackSpeedMultiplier = 1
  moveSpeedMultiplier = 1

  addDamagePercent(amount: number): void {
    this.damageMultiplier *= 1 + amount
  }

  addAttackSpeedPercent(amount: number): void {
    this.attackSpeedMultiplier *= 1 + amount
  }

  addMoveSpeedPercent(amount: number): void {
    this.moveSpeedMultiplier *= 1 + amount
  }

  addArmor(amount: number): void {
    this.armor = Math.max(0, this.armor + amount)
  }

  addDodgeChance(amount: number): void {
    this.dodgeChance = Math.min(
      GAME_CONFIG.player.dodgeChanceCap,
      Math.max(0, this.dodgeChance + amount),
    )
  }

  addHpRegen(amount: number): void {
    this.hpRegenPerSecond = Math.max(0, this.hpRegenPerSecond + amount)
  }

  addPickupRange(amount: number): void {
    this.pickupRange = Math.max(0, this.pickupRange + amount)
  }

  addMaxHP(amount: number): void { this.maxHP = Math.max(1, this.maxHP + amount) }
}
