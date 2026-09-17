import { CORE_SKILL_DEFINITIONS, BASIC_PROJECTILE_SKILL } from './definitions/coreSkills.ts'
import type { SkillDefinition } from './SkillDefinition.ts'
import { EVOLUTION_SKILLS, TIER_1_SKILLS, TIER_2_SKILLS } from './definitions/evolutionSkills.ts'

const allDefinitions = [...CORE_SKILL_DEFINITIONS, ...EVOLUTION_SKILLS]
const registry = new Map(allDefinitions.map((definition) => [definition.id, definition]))

export const EVOLUTION_SKILL_DEFINITIONS = EVOLUTION_SKILLS
export const TIER_1_EVOLUTION_SKILLS = TIER_1_SKILLS
export const TIER_2_EVOLUTION_SKILLS = TIER_2_SKILLS

export function getSkillDefinition(id: string): SkillDefinition | undefined {
  return registry.get(id)
}

export function resolveDebugSkillLoadout(search: string): SkillDefinition[] {
  const requested = new URLSearchParams(search).get('skills')
  const selected = new Map<string, SkillDefinition>([[BASIC_PROJECTILE_SKILL.id, BASIC_PROJECTILE_SKILL]])

  if (!requested) return [...selected.values()]

  const ids = requested === 'all'
    ? allDefinitions.map((definition) => definition.id)
    : requested.split(',').map((id) => id.trim().toLowerCase()).filter(Boolean)

  for (const id of ids) {
    const definition = getSkillDefinition(id)
    if (definition) selected.set(definition.id, definition)
  }

  return [...selected.values()]
}
