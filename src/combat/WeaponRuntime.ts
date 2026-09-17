import { WEAPON_DEFINITIONS } from './weaponDefinitions.ts'
import { WeaponType, type WeaponDefinition, type WeaponStatKey } from './WeaponDefinition.ts'
import type { WeaponUpgradeDefinition } from './WeaponUpgradeDefinition.ts'
import type { SynergyUpgradeDefinition } from './SynergyUpgradeDefinition.ts'
import { SynergyRuntime } from './SynergyRuntime.ts'

export class WeaponRuntime {
  readonly synergy = new SynergyRuntime(WeaponType.BasicAttack)
  private currentType: WeaponType = WeaponType.BasicAttack
  private currentEvolutionId = ''
  private readonly appliedUpgrades = new Map<string, WeaponUpgradeDefinition>()
  private readonly statModifiers: Array<{ stat: WeaponStatKey; operation: 'Add' | 'Multiply'; value: number; weaponType?: WeaponType }> = []

  get weaponType(): WeaponType { return this.currentType }

  get stats(): WeaponDefinition {
    const stats: WeaponDefinition = { ...WEAPON_DEFINITIONS[this.currentType] }
    for (const upgrade of this.appliedUpgrades.values()) {
      if (upgrade.weaponType !== this.currentType) continue
      for (const modifier of upgrade.modifiers) {
        const key = modifier.stat
        const current = stats[key]
        ;(stats as unknown as Record<WeaponStatKey, number>)[key] = modifier.operation === 'Add'
          ? current + modifier.value
          : current * modifier.value
      }
    }
    for (const modifier of this.statModifiers) {
      if (modifier.weaponType && modifier.weaponType !== this.currentType) continue
      const current = stats[modifier.stat]
      ;(stats as unknown as Record<WeaponStatKey, number>)[modifier.stat] = modifier.operation === 'Add'
        ? current + modifier.value
        : current * modifier.value
    }
    stats.projectileCount = Math.max(1, Math.round(stats.projectileCount))
    stats.spread = Math.max(0, stats.spread)
    stats.attackInterval = Math.max(0.05, stats.attackInterval)
    return stats
  }

  equip(type: WeaponType): void {
    this.currentType = type
    this.synergy.setContext(type, this.currentEvolutionId)
  }

  setEvolution(evolutionId: string): void {
    this.currentEvolutionId = evolutionId
    this.synergy.setContext(this.currentType, evolutionId)
  }

  applyWeaponUpgrade(definition: WeaponUpgradeDefinition): boolean {
    if (definition.weaponType !== this.currentType || this.appliedUpgrades.has(definition.id)) return false
    this.appliedUpgrades.set(definition.id, definition)
    return true
  }

  applySynergyUpgrade(definition: SynergyUpgradeDefinition): boolean {
    return this.synergy.applyUpgrade(definition)
  }

  addStatModifier(stat: WeaponStatKey, operation: 'Add' | 'Multiply', value: number, weaponType?: WeaponType): void {
    this.statModifiers.push({ stat, operation, value, weaponType })
  }

  get appliedWeaponUpgradeIds(): readonly string[] { return [...this.appliedUpgrades.keys()] }
}
