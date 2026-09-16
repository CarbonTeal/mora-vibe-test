import type { ElementType } from '../elements/ElementType.ts'
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
    }
    this.events.emit(event)
    return event
  }
}
