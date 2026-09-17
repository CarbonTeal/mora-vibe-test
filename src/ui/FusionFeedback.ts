import type { FusionEventBus } from '../fusion/FusionEventBus.ts'
import type { FusionCreatedEvent } from '../fusion/FusionTypes.ts'

export interface FusionFeedbackElements {
  root: HTMLElement
  source: HTMLElement
  glyph: HTMLElement
  name: HTMLElement
}

export class FusionFeedback {
  private readonly elements: FusionFeedbackElements
  private readonly unsubscribe: () => void
  private hideTimer = 0

  constructor(elements: FusionFeedbackElements, events: FusionEventBus) {
    this.elements = elements
    this.unsubscribe = events.subscribe((event) => this.show(event))
  }

  dispose(): void {
    this.unsubscribe()
    window.clearTimeout(this.hideTimer)
  }

  private show(event: FusionCreatedEvent): void {
    window.clearTimeout(this.hideTimer)
    this.elements.source.textContent = event.sourceLabel
    this.elements.glyph.textContent = event.displayGlyph
    this.elements.name.textContent = event.displayName
    this.elements.root.classList.remove('fusion-feedback--visible')
    void this.elements.root.offsetWidth
    this.elements.root.classList.add('fusion-feedback--visible')
    this.hideTimer = window.setTimeout(() => {
      this.elements.root.classList.remove('fusion-feedback--visible')
    }, 1400)
  }
}
