import type { FusionResolver } from '../fusion/FusionResolver.ts'
import { FusionMode, type FusionCreatedEvent } from '../fusion/FusionTypes.ts'
import type { ElementBuildSystem } from './ElementBuildSystem.ts'

export class EvolutionSystem {
  private readonly build: ElementBuildSystem
  private readonly resolver: FusionResolver

  constructor(
    build: ElementBuildSystem,
    resolver: FusionResolver,
  ) {
    this.build = build
    this.resolver = resolver
  }

  evolve(): FusionCreatedEvent | undefined {
    const inventory = this.build.state.elements
    if (inventory.pendingElement) return undefined
    const first = inventory.pending1?.element
    const second = inventory.pending2?.element
    if (!first) return undefined

    let event: FusionCreatedEvent | undefined
    if (second) {
      event = this.resolver.resolve(first, second, FusionMode.Simultaneous)
    } else {
      const currentElement = this.build.state.currentEvolution?.baseElement
      event = currentElement
        ? this.resolver.resolve(currentElement, first, FusionMode.Sequential)
        : this.build.state.currentEvolution
          ? undefined
          : this.resolver.resolveSingle(first)
    }

    if (event) this.build.clearPendingElements()
    return event
  }
}
