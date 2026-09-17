import type { WeaponType } from './WeaponDefinition.ts'
import { SynergyParameter, type SynergyUpgradeDefinition } from './SynergyUpgradeDefinition.ts'

interface SynergyState { stacks: number; remaining: number }

export class SynergyRuntime {
  private readonly acquired = new Map<string, SynergyUpgradeDefinition>()
  private readonly states = new Map<string, SynergyState>()
  private readonly hitTargetsByAttack = new Map<number, Set<string>>()
  private readonly multiHitTriggered = new Set<string>()
  private weaponType: WeaponType
  private evolutionId = ''

  constructor(weaponType: WeaponType) { this.weaponType = weaponType }

  setContext(weaponType: WeaponType, evolutionId: string): void {
    if (weaponType === this.weaponType && evolutionId === this.evolutionId) return
    this.weaponType = weaponType
    this.evolutionId = evolutionId
    this.clearTransientState()
  }

  canApply(definition: SynergyUpgradeDefinition): boolean {
    return definition.requirements.weaponType === this.weaponType && definition.requirements.evolutionId === this.evolutionId
  }

  hasUpgrade(id: string): boolean { return this.acquired.has(id) }

  applyUpgrade(definition: SynergyUpgradeDefinition): boolean {
    if (!this.canApply(definition) || this.acquired.has(definition.id)) return false
    this.acquired.set(definition.id, definition)
    return true
  }

  update(delta: number): void {
    for (const [id, state] of this.states) {
      state.remaining -= delta
      if (state.remaining <= 0) this.states.delete(id)
    }
    if (this.hitTargetsByAttack.size > 64) this.hitTargetsByAttack.clear()
    if (this.multiHitTriggered.size > 64) this.multiHitTriggered.clear()
  }

  recordHit(attackId: number, targetId: string): void {
    const targets = this.hitTargetsByAttack.get(attackId) ?? new Set<string>()
    targets.add(targetId)
    this.hitTargetsByAttack.set(attackId, targets)
    for (const definition of this.activeDefinitions) {
      if (definition.trigger === 'OnHit') this.activate(definition)
      if (definition.trigger === 'OnMultiHit' && targets.size >= 2) {
        const key = `${definition.id}:${attackId}`
        if (!this.multiHitTriggered.has(key)) {
          this.multiHitTriggered.add(key)
          this.activate(definition)
        }
      }
    }
  }

  getMultiplier(parameter: SynergyParameter): number {
    let result = 1
    for (const definition of this.activeDefinitions) {
      const stacks = definition.trigger === 'Always' ? 1 : (this.states.get(definition.id)?.stacks ?? 0)
      if (stacks <= 0) continue
      for (const modifier of definition.modifiers) {
        if (modifier.parameter === parameter && modifier.operation === 'Multiply') result *= modifier.value ** stacks
      }
    }
    return result
  }

  getAdditive(parameter: SynergyParameter): number {
    let result = 0
    for (const definition of this.activeDefinitions) {
      const stacks = definition.trigger === 'Always' ? 1 : (this.states.get(definition.id)?.stacks ?? 0)
      if (stacks <= 0) continue
      for (const modifier of definition.modifiers) {
        if (modifier.parameter === parameter && modifier.operation === 'Add') result += modifier.value * stacks
      }
    }
    return result
  }

  get activeSummary(): string[] {
    return this.activeDefinitions.flatMap((definition) => {
      const stacks = definition.trigger === 'Always' ? 1 : (this.states.get(definition.id)?.stacks ?? 0)
      return stacks > 0 ? [`${definition.name}${stacks > 1 ? ` x${stacks}` : ''}`] : []
    })
  }

  get eligibleAcquiredDefinitions(): readonly SynergyUpgradeDefinition[] { return this.activeDefinitions }

  clearTransientState(): void {
    this.states.clear()
    this.hitTargetsByAttack.clear()
    this.multiHitTriggered.clear()
  }

  private get activeDefinitions(): SynergyUpgradeDefinition[] {
    return [...this.acquired.values()].filter((definition) => this.canApply(definition))
  }

  private activate(definition: SynergyUpgradeDefinition): void {
    const current = this.states.get(definition.id)
    this.states.set(definition.id, {
      stacks: Math.min(definition.maxStacks ?? 1, (current?.stacks ?? 0) + 1),
      remaining: definition.duration ?? 1,
    })
  }
}
