import type { FusionResolver } from '../fusion/FusionResolver.ts'
import { FusionMode, type FusionCreatedEvent } from '../fusion/FusionTypes.ts'
import type { ElementBuildSystem } from './ElementBuildSystem.ts'
import type { FusionEventBus } from '../fusion/FusionEventBus.ts'
import { ELEMENT_PRESENTATION } from './ElementType.ts'
import { getSkillDefinition } from '../skills/SkillRegistry.ts'

export class EvolutionSystem {
  private readonly build: ElementBuildSystem
  private readonly resolver: FusionResolver
  private readonly events: FusionEventBus

  constructor(
    build: ElementBuildSystem,
    resolver: FusionResolver,
    events: FusionEventBus,
  ) {
    this.build = build
    this.resolver = resolver
    this.events = events
  }

  evolve(): FusionCreatedEvent | undefined {
    const tier3Pending = this.build.tier3Pending
    const current = this.build.state.currentEvolution
    if (tier3Pending && current?.tier === 2) {
      const definition = getSkillDefinition(tier3Pending.targetTier3Id)
      if (!definition || definition.tier !== 3 || definition.baseTier2Id !== current.id) return undefined
      this.build.consumeTier3Pending()
      const event: FusionCreatedEvent = {
        recipeId: `tier3-${current.id}-${tier3Pending.element}`,
        inputA: tier3Pending.element,
        inputB: tier3Pending.element,
        mode: FusionMode.Sequential,
        resultSkillId: definition.id,
        displayName: definition.specialName ?? definition.name,
        displayGlyph: definition.displayGlyph ?? current.glyph,
        sourceLabel: `${current.glyph} + ${ELEMENT_PRESENTATION[tier3Pending.element].glyph}`,
      }
      this.events.emit(event)
      return event
    }
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
