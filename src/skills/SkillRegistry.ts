import { CORE_SKILL_DEFINITIONS, BASIC_PROJECTILE_SKILL } from './definitions/coreSkills.ts'
import type { SkillDefinition } from './SkillDefinition.ts'

const registry = new Map(CORE_SKILL_DEFINITIONS.map((definition) => [definition.id, definition]))

export function getSkillDefinition(id: string): SkillDefinition | undefined {
  return registry.get(id)
}

export function resolveDebugSkillLoadout(search: string): SkillDefinition[] {
  const requested = new URLSearchParams(search).get('skills')
  const selected = new Map<string, SkillDefinition>([[BASIC_PROJECTILE_SKILL.id, BASIC_PROJECTILE_SKILL]])

  if (!requested) return [...selected.values()]

  const ids = requested === 'all'
    ? CORE_SKILL_DEFINITIONS.map((definition) => definition.id)
    : requested.split(',').map((id) => id.trim().toLowerCase()).filter(Boolean)

  for (const id of ids) {
    const definition = getSkillDefinition(id)
    if (definition) selected.set(definition.id, definition)
  }

  return [...selected.values()]
}
