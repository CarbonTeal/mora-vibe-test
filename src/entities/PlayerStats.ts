export class PlayerStats {
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
}
