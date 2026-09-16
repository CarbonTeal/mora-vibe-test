import type { ElementType } from './ElementType.ts'

export interface ElementAcquisition {
  element: ElementType
  order: number
}

export class ElementInventory {
  private readonly acquisitions: ElementAcquisition[] = []

  get history(): readonly ElementAcquisition[] {
    return this.acquisitions
  }

  get lastElement(): ElementType | undefined {
    return this.acquisitions.at(-1)?.element
  }

  add(element: ElementType): ElementAcquisition {
    const acquisition = { element, order: this.acquisitions.length + 1 }
    this.acquisitions.push(acquisition)
    return acquisition
  }

  clear(): void {
    this.acquisitions.length = 0
  }
}
