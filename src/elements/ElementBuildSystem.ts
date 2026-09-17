import type { FusionEventBus } from '../fusion/FusionEventBus.ts'
import { BuildState } from './BuildState.ts'
import type { ElementDiscardChoice, ElementPickupResult } from './ElementInventory.ts'
import type { ElementType } from './ElementType.ts'
import type { SkillDefinition } from '../skills/SkillDefinition.ts'

export class ElementBuildSystem {
  readonly state = new BuildState()
  private readonly unsubscribe: () => void
  private readonly queuedElementCores: ElementType[] = []

  constructor(events: FusionEventBus) {
    this.unsubscribe = events.subscribe((event) => this.state.recordFusion(event))
  }

  pickupElement(element: ElementType): ElementPickupResult {
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

  clearCurrentEvolution(): void { this.state.clearCurrentEvolution() }

  forceEvolution(definition: SkillDefinition): void {
    this.state.setEvolutionDefinition(definition)
    this.clearPendingElements()
  }

  reset(): void {
    this.state.clear()
    this.queuedElementCores.length = 0
  }

  get queuedElementCoreCount(): number { return this.queuedElementCores.length }

  dispose(): void {
    this.unsubscribe()
  }
}
