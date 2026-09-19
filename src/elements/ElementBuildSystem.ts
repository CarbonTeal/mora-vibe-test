import type { FusionEventBus } from '../fusion/FusionEventBus.ts'
import { BuildState } from './BuildState.ts'
import type { ElementDiscardChoice, ElementPickupResult } from './ElementInventory.ts'
import type { ElementType } from './ElementType.ts'
import type { SkillDefinition } from '../skills/SkillDefinition.ts'
import { getEvolutionTier } from './BuildState.ts'
import { getSkillDefinition } from '../skills/SkillRegistry.ts'

export class ElementBuildSystem {
  readonly state = new BuildState()
  private readonly unsubscribe: () => void
  private readonly queuedElementCores: ElementType[] = []
  private tier3PendingState?: { element: ElementType; targetTier3Id: string }
  private tier4PendingState?: { element: ElementType; targetTier4Id: string }

  constructor(events: FusionEventBus) {
    this.unsubscribe = events.subscribe((event) => this.state.recordFusion(event))
  }

  pickupElement(element: ElementType): ElementPickupResult {
    if (!this.canPickupElementCore) return 'converted'
    if (this.state.elements.pendingElement) {
      this.queuedElementCores.push(element)
      return 'queued'
    }
    return this.state.elements.add(element)
  }

  resolveOverflow(choice: ElementDiscardChoice): void {
    this.state.elements.resolveOverflow(choice)
    const next = this.queuedElementCores.shift()
    if (next) this.state.elements.add(next)
  }

  clearPendingElements(): void {
    this.state.elements.clearPendingElements()
    this.queuedElementCores.length = 0
  }

  clearCurrentEvolution(): void {
    this.state.clearCurrentEvolution()
    this.tier3PendingState = undefined
    this.tier4PendingState = undefined
  }

  setTier3Pending(element: ElementType, targetTier3Id: string): boolean {
    if (this.evolutionTier !== 2) return false
    const target = getSkillDefinition(targetTier3Id)
    if (target?.tier !== 3 || target.baseTier2Id !== this.state.currentEvolution?.id || target.requiredElement !== element) return false
    this.tier3PendingState = { element, targetTier3Id }
    return true
  }

  consumeTier3Pending(): { element: ElementType; targetTier3Id: string } | undefined {
    const pending = this.tier3PendingState
    this.tier3PendingState = undefined
    return pending
  }

  setTier4Pending(element: ElementType, targetTier4Id: string): boolean {
    if (this.evolutionTier !== 3) return false
    const target = getSkillDefinition(targetTier4Id)
    if (target?.tier !== 4 || target.baseTier3Id !== this.state.currentEvolution?.id || target.requiredElement !== element) return false
    this.tier4PendingState = { element, targetTier4Id }
    return true
  }

  consumeTier4Pending(): { element: ElementType; targetTier4Id: string } | undefined {
    const pending = this.tier4PendingState
    this.tier4PendingState = undefined
    return pending
  }

  forceEvolution(definition: SkillDefinition): void {
    this.state.setEvolutionDefinition(definition)
    this.clearPendingElements()
    this.tier3PendingState = undefined
    this.tier4PendingState = undefined
  }

  reset(): void {
    this.state.clear()
    this.queuedElementCores.length = 0
    this.tier3PendingState = undefined
    this.tier4PendingState = undefined
  }

  get queuedElementCoreCount(): number { return this.queuedElementCores.length }
  get evolutionTier(): 0 | 1 | 2 | 3 | 4 { return getEvolutionTier(this.state.currentEvolution) }
  get canPickupElementCore(): boolean { return this.evolutionTier < 2 }
  get elementCoreMode(): 'Evolution' | 'MoneyConversion' {
    return this.canPickupElementCore ? 'Evolution' : 'MoneyConversion'
  }
  get tier3Pending(): { element: ElementType; targetTier3Id: string } | undefined { return this.tier3PendingState }
  get tier4Pending(): { element: ElementType; targetTier4Id: string } | undefined { return this.tier4PendingState }

  dispose(): void {
    this.unsubscribe()
  }
}
