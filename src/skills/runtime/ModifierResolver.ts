import type { SkillDefinition } from '../SkillDefinition.ts'
import type { ModifierType } from '../SkillEnums.ts'

export function getModifierValue(
  definition: SkillDefinition,
  type: ModifierType,
  fallback: number,
): number {
  return definition.modifiers.find((modifier) => modifier.type === type)?.value ?? fallback
}
