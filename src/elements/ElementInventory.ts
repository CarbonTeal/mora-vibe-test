import type { ElementType } from './ElementType.ts'

export interface PendingElementEntry {
  element: ElementType
  order: number
}

export type ElementDiscardChoice = 'pending1' | 'pending2' | 'incoming'
export type ElementPickupResult = 'added' | 'choice-required' | 'queued'

export class ElementInventory {
  private readonly entries: PendingElementEntry[] = []
  private nextOrder = 1
  pendingElement?: PendingElementEntry

  get pendingElements(): readonly PendingElementEntry[] { return this.entries }
  get pending1(): PendingElementEntry | undefined { return this.entries[0] }
  get pending2(): PendingElementEntry | undefined { return this.entries[1] }
  get isFull(): boolean { return this.entries.length === 2 }
  get specialFusionAvailable(): boolean {
    return Boolean(this.pending1 && this.pending2 && this.pending1.element !== this.pending2.element)
  }

  add(element: ElementType): ElementPickupResult {
    const entry = { element, order: this.nextOrder++ }
    if (this.isFull) {
      this.pendingElement = entry
      return 'choice-required'
    }
    this.entries.push(entry)
    return 'added'
  }

  resolveOverflow(choice: ElementDiscardChoice): void {
    const incoming = this.pendingElement
    if (!incoming) return
    if (choice === 'pending1') {
      this.entries.shift()
      this.entries.push(incoming)
    } else if (choice === 'pending2') {
      this.entries.pop()
      this.entries.push(incoming)
    }
    this.pendingElement = undefined
  }

  clearPendingElements(): void {
    this.entries.length = 0
    this.pendingElement = undefined
  }

  clear(): void {
    this.clearPendingElements()
    this.nextOrder = 1
  }
}
