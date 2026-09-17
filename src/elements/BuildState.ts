import type { FusionCreatedEvent } from '../fusion/FusionTypes.ts'
import { ElementInventory } from './ElementInventory.ts'
import type { ElementType } from './ElementType.ts'
import type { SkillDefinition } from '../skills/SkillDefinition.ts'

export interface EvolutionState {
  id: string
  name: string
  glyph: string
  baseElement?: ElementType
}

export class BuildState {
  readonly elements = new ElementInventory()
  readonly fusionHistory: FusionCreatedEvent[] = []
  readonly unlockedResultSkillIds = new Set<string>()
  currentEvolution?: EvolutionState

  get recentFusion(): FusionCreatedEvent | undefined {
    return this.fusionHistory.at(-1)
  }

  recordFusion(event: FusionCreatedEvent): void {
    this.fusionHistory.push(event)
    this.unlockedResultSkillIds.add(event.resultSkillId)
    this.currentEvolution = {
      id: event.resultSkillId,
      name: event.displayName,
      glyph: event.displayGlyph,
      baseElement: event.recipeId.startsWith('single-') ? event.inputA : undefined,
    }
  }

  clearCurrentEvolution(): void { this.currentEvolution = undefined }

  setEvolutionDefinition(definition: SkillDefinition): void {
    this.currentEvolution = {
      id: definition.id,
      name: definition.name,
      glyph: definition.displayGlyph ?? definition.name.slice(0, 1),
      baseElement: definition.id.startsWith('element-')
        ? definition.id.slice('element-'.length).replace(/^./, (letter) => letter.toUpperCase()) as ElementType
        : undefined,
    }
  }

  clear(): void {
    this.elements.clear()
    this.fusionHistory.length = 0
    this.unlockedResultSkillIds.clear()
    this.clearCurrentEvolution()
  }
}
