import type { SkillDefinition } from '../skills/SkillDefinition.ts'
import { SkillBehaviour } from '../skills/SkillEnums.ts'
import type { BuffTag } from './BuffDefinition.ts'

const BEHAVIOUR_TAGS: Partial<Record<string, readonly BuffTag[]>> = {
  [SkillBehaviour.Projectile]: ['Projectile', 'Damage', 'AttackSpeed', 'Range'],
  [SkillBehaviour.BurstProjectile]: ['Projectile', 'Damage', 'AttackSpeed', 'Range'],
  [SkillBehaviour.Split]: ['Projectile', 'Damage', 'Range'],
  [SkillBehaviour.Ricochet]: ['Projectile', 'Damage', 'Range'],
  [SkillBehaviour.Homing]: ['Projectile', 'Damage', 'Range'],
  [SkillBehaviour.ZoneProjectile]: ['Zone', 'Damage', 'Sustain'],
  [SkillBehaviour.PullField]: ['PullField', 'Zone', 'Sustain'],
  [SkillBehaviour.Aura]: ['Aura', 'Defense', 'Sustain', 'Mobility'],
  [SkillBehaviour.Orbit]: ['Orbit', 'Defense', 'Mobility'],
  [SkillBehaviour.Beam]: ['Beam', 'Damage', 'Range'],
  [SkillBehaviour.Cone]: ['Cone', 'Damage', 'Defense'],
  [SkillBehaviour.Wave]: ['Wave', 'Damage', 'Knockback'],
  [SkillBehaviour.Rain]: ['Mobility', 'Defense', 'Sustain'],
  [SkillBehaviour.Trail]: ['Mobility', 'Zone', 'Defense'],
}

const SKILL_PREFERENCES: Record<string, readonly BuffTag[]> = {
  rain: ['Mobility', 'Defense', 'Sustain'],
  explosion: ['Damage', 'AttackSpeed', 'Range', 'Projectile'],
}

export function getSkillGameplayTags(definition?: SkillDefinition): readonly BuffTag[] {
  if (!definition) return []
  return [...new Set([...(BEHAVIOUR_TAGS[definition.behaviour ?? ''] ?? []), ...(SKILL_PREFERENCES[definition.id] ?? [])])]
}
