import type { FusionEventBus } from '../fusion/FusionEventBus.ts'
import type { FusionResolver } from '../fusion/FusionResolver.ts'
import { FusionMode } from '../fusion/FusionTypes.ts'
import { BuildState } from './BuildState.ts'
import type { ElementType } from './ElementType.ts'

export class ElementBuildSystem {
  readonly state = new BuildState()
  mode: FusionMode = FusionMode.Sequential
  private pendingSimultaneous?: ElementType
  private readonly resolver: FusionResolver
  private readonly unsubscribe: () => void

  constructor(resolver: FusionResolver, events: FusionEventBus) {
    this.resolver = resolver
    this.unsubscribe = events.subscribe((event) => this.state.recordFusion(event))
  }

  addElement(element: ElementType): void {
    if (this.mode === FusionMode.Sequential) {
      const previous = this.state.elements.lastElement
      this.state.elements.add(element)
      if (previous) this.resolver.resolve(previous, element, FusionMode.Sequential)
      return
    }

    this.state.elements.add(element)
    if (!this.pendingSimultaneous) {
      this.pendingSimultaneous = element
      return
    }

    this.resolver.resolve(this.pendingSimultaneous, element, FusionMode.Simultaneous)
    this.pendingSimultaneous = undefined
  }

  toggleMode(): FusionMode {
    this.mode = this.mode === FusionMode.Sequential
      ? FusionMode.Simultaneous
      : FusionMode.Sequential
    this.pendingSimultaneous = undefined
    return this.mode
  }

  reset(): void {
    this.state.clear()
    this.pendingSimultaneous = undefined
    this.mode = FusionMode.Sequential
  }

  dispose(): void {
    this.unsubscribe()
  }
}
