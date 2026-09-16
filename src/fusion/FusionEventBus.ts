import type { FusionCreatedEvent } from './FusionTypes.ts'

type FusionListener = (event: FusionCreatedEvent) => void

export class FusionEventBus {
  private readonly listeners = new Set<FusionListener>()

  subscribe(listener: FusionListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  emit(event: FusionCreatedEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}
