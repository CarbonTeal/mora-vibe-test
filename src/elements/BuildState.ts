import type { FusionCreatedEvent } from '../fusion/FusionTypes.ts'
import { ElementInventory } from './ElementInventory.ts'

export class BuildState {
  readonly elements = new ElementInventory()
  readonly fusionHistory: FusionCreatedEvent[] = []
  readonly unlockedResultSkillIds = new Set<string>()

  get recentFusion(): FusionCreatedEvent | undefined {
    return this.fusionHistory.at(-1)
  }

  recordFusion(event: FusionCreatedEvent): void {
    this.fusionHistory.push(event)
    this.unlockedResultSkillIds.add(event.resultSkillId)
  }

  clear(): void {
    this.elements.clear()
    this.fusionHistory.length = 0
    this.unlockedResultSkillIds.clear()
  }
}
