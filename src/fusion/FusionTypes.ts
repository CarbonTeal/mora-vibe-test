import type { ElementType } from '../elements/ElementType.ts'

type ValueOf<T> = T[keyof T]

export const FusionMode = {
  Sequential: 'Sequential',
  Simultaneous: 'Simultaneous',
} as const
export type FusionMode = ValueOf<typeof FusionMode>

export interface FusionRecipe {
  id: string
  inputA: ElementType
  inputB: ElementType
  mode: FusionMode
  resultSkillId: string
  displayName: string
  displayGlyph: string
}

export interface FusionCreatedEvent {
  recipeId: string
  inputA: ElementType
  inputB: ElementType
  mode: FusionMode
  resultSkillId: string
  displayName: string
  displayGlyph: string
}
