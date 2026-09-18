import { CORE_SKILL_DEFINITIONS, BASIC_PROJECTILE_SKILL } from './definitions/coreSkills.ts'
import type { EvolutionAttackMode, SkillDefinition, WeaponStatInheritance } from './SkillDefinition.ts'
import { EVOLUTION_SKILLS, TIER_1_SKILLS, TIER_2_SKILLS } from './definitions/evolutionSkills.ts'
import { TIER_3_BY_BASE_TIER2, TIER_3_SKILLS } from './definitions/tier3Skills.ts'

const evolutionDefinitions = [...EVOLUTION_SKILLS, ...TIER_3_SKILLS]
const allDefinitions = [...CORE_SKILL_DEFINITIONS, ...evolutionDefinitions]
const registry = new Map(allDefinitions.map((definition) => [definition.id, definition]))

export const EVOLUTION_SKILL_DEFINITIONS = evolutionDefinitions
export const TIER_1_EVOLUTION_SKILLS = TIER_1_SKILLS
export const TIER_2_EVOLUTION_SKILLS = TIER_2_SKILLS
export const TIER_3_EVOLUTION_SKILLS = TIER_3_SKILLS

export interface EvolutionAttackModeAuditRow {
  skillId: string
  tier: 2 | 3
  baseTier2Id: string
  attackMode: EvolutionAttackMode
  weaponFireEnabled: boolean
  weaponStatInheritance: WeaponStatInheritance
  couplingTrigger: string
}

export function getSkillDefinition(id: string): SkillDefinition | undefined {
  return registry.get(id)
}

export function getTier3ForBaseTier2(id: string): SkillDefinition | undefined {
  return TIER_3_BY_BASE_TIER2.get(getBaseTier2Id(id))
}

export function getBaseTier2Id(id: string): string {
  return registry.get(id)?.baseTier2Id ?? id
}

export function getEvolutionAttackModeAudit(): readonly EvolutionAttackModeAuditRow[] {
  return [...TIER_2_SKILLS, ...TIER_3_SKILLS].map((definition) => ({
    skillId: definition.id,
    tier: definition.tier as 2 | 3,
    baseTier2Id: definition.baseTier2Id ?? definition.id,
    attackMode: definition.attackMode!,
    weaponFireEnabled: definition.attackMode !== 'weaponReplacement',
    weaponStatInheritance: definition.weaponStatInheritance!,
    couplingTrigger: definition.secondaryConfig?.couplingTrigger ?? '',
  }))
}

export function validateEvolutionAttackModes(): void {
  const expectedCounts: Record<EvolutionAttackMode, number> = {
    weaponModifier: 11,
    weaponReplacement: 27,
    additive: 7,
  }
  if (TIER_2_SKILLS.length !== 45) throw new Error(`AttackMode audit expected 45 Tier2 skills, got ${TIER_2_SKILLS.length}`)
  for (const mode of Object.keys(expectedCounts) as EvolutionAttackMode[]) {
    const actual = TIER_2_SKILLS.filter((definition) => definition.attackMode === mode).length
    if (actual !== expectedCounts[mode]) throw new Error(`AttackMode ${mode} expected ${expectedCounts[mode]}, got ${actual}`)
  }
  for (const definition of TIER_2_SKILLS) {
    if (!definition.attackMode || !definition.weaponStatInheritance) throw new Error(`Missing AttackMode metadata: ${definition.id}`)
    const inheritance = definition.weaponStatInheritance
    if (definition.attackMode === 'additive' && Object.values(inheritance).some(Boolean)) {
      throw new Error(`Additive utility must not inherit weapon cadence or damage: ${definition.id}`)
    }
  }
  for (const definition of TIER_3_SKILLS) {
    const base = registry.get(definition.baseTier2Id!)
    if (!base || definition.attackMode !== base.attackMode) throw new Error(`Tier3 AttackMode inheritance mismatch: ${definition.id}`)
    if (JSON.stringify(definition.weaponStatInheritance) !== JSON.stringify(base.weaponStatInheritance)) {
      throw new Error(`Tier3 weapon stat inheritance mismatch: ${definition.id}`)
    }
  }
}

validateEvolutionAttackModes()

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
