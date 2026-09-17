import type { PlayerStats } from '../entities/PlayerStats.ts'
import type { WeaponRuntime } from '../combat/WeaponRuntime.ts'
import type { BuffDefinition, BuffStatModifier, PlayerBuffStat } from './BuffDefinition.ts'

export class BuffRuntime {
  private readonly stacks = new Map<string, number>()
  private readonly definitions = new Map<string, BuffDefinition>()
  private readonly stats: PlayerStats
  private readonly weapon: WeaponRuntime

  constructor(stats: PlayerStats, weapon: WeaponRuntime) {
    this.stats = stats
    this.weapon = weapon
  }

  getStackCount(id: string): number { return this.stacks.get(id) ?? 0 }
  canAcquire(definition: BuffDefinition): boolean { return this.getStackCount(definition.id) < definition.maxStacks }

  acquire(definition: BuffDefinition): boolean {
    if (!this.canAcquire(definition)) return false
    for (const modifier of definition.statModifiers) this.applyModifier(modifier)
    this.stacks.set(definition.id, this.getStackCount(definition.id) + 1)
    this.definitions.set(definition.id, definition)
    return true
  }

  get ownedSummary(): readonly string[] {
    return [...this.stacks].map(([id, count]) => `${this.definitions.get(id)?.displayName ?? id}${count > 1 ? ` x${count}` : ''}`)
  }

  private applyModifier(modifier: BuffStatModifier): void {
    if (modifier.target === 'Weapon') {
      this.weapon.addStatModifier(modifier.stat as never, modifier.operation, modifier.value, modifier.weaponType)
      return
    }
    const stat = modifier.stat as PlayerBuffStat
    if (stat === 'Damage') this.stats.damageMultiplier *= modifier.operation === 'Multiply' ? modifier.value : 1 + modifier.value
    else if (stat === 'AttackSpeed') this.stats.attackSpeedMultiplier *= modifier.operation === 'Multiply' ? modifier.value : 1 + modifier.value
    else if (stat === 'MoveSpeed') this.stats.moveSpeedMultiplier *= modifier.operation === 'Multiply' ? modifier.value : 1 + modifier.value
    else if (stat === 'MaxHP') this.stats.addMaxHP(modifier.operation === 'Add' ? modifier.value : this.stats.maxHP * (modifier.value - 1))
    else if (stat === 'Armor') this.stats.addArmor(modifier.operation === 'Add' ? modifier.value : this.stats.armor * (modifier.value - 1))
    else if (stat === 'Dodge') this.stats.addDodgeChance(modifier.operation === 'Add' ? modifier.value : this.stats.dodgeChance * (modifier.value - 1))
    else if (stat === 'HPRegen') this.stats.addHpRegen(modifier.operation === 'Add' ? modifier.value : this.stats.hpRegenPerSecond * (modifier.value - 1))
    else if (stat === 'PickupRange') this.stats.addPickupRange(modifier.operation === 'Add' ? modifier.value : this.stats.pickupRange * (modifier.value - 1))
  }
}
