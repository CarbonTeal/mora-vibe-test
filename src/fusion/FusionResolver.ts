import { ELEMENT_PRESENTATION, type ElementType } from '../elements/ElementType.ts'
import type { FusionEventBus } from './FusionEventBus.ts'
import { FusionMode, type FusionCreatedEvent, type FusionRecipe } from './FusionTypes.ts'

export class FusionResolver {
  private readonly recipes: readonly FusionRecipe[]
  private readonly events: FusionEventBus

  constructor(recipes: readonly FusionRecipe[], events: FusionEventBus) {
    this.recipes = recipes
    this.events = events
  }

  resolve(inputA: ElementType, inputB: ElementType, mode: FusionMode): FusionCreatedEvent | undefined {
    const recipe = this.recipes.find((candidate) => {
      if (candidate.mode !== mode) return false
      if (mode === FusionMode.Sequential) {
        return candidate.inputA === inputA && candidate.inputB === inputB
      }
      return (
        (candidate.inputA === inputA && candidate.inputB === inputB) ||
        (candidate.inputA === inputB && candidate.inputB === inputA)
      )
    })

    if (!recipe) return undefined
    const event: FusionCreatedEvent = {
      recipeId: recipe.id,
      inputA,
      inputB,
      mode,
      resultSkillId: recipe.resultSkillId,
      displayName: recipe.displayName,
      displayGlyph: recipe.displayGlyph,
      sourceLabel: `${ELEMENT_PRESENTATION[inputA].glyph} ${mode === FusionMode.Sequential ? '→' : '+'} ${ELEMENT_PRESENTATION[inputB].glyph}`,
    }
    this.events.emit(event)
    return event
  }

  resolveSingle(element: ElementType): FusionCreatedEvent {
    const presentation = ELEMENT_PRESENTATION[element]
    const event: FusionCreatedEvent = {
      recipeId: `single-${element.toLowerCase()}`,
      inputA: element,
      inputB: element,
      mode: FusionMode.Sequential,
      resultSkillId: `element-${element.toLowerCase()}`,
      displayName: presentation.name,
      displayGlyph: presentation.glyph,
      sourceLabel: presentation.glyph,
    }
    this.events.emit(event)
    return event
  }
}
