import type { SkillDefinition } from '../SkillDefinition.ts'
import {
  EffectType,
  ModifierType,
  SkillCarrier,
  SkillForm,
  SkillTrigger,
} from '../SkillEnums.ts'

export const BASIC_PROJECTILE_SKILL: SkillDefinition = {
  id: 'basic-projectile',
  name: 'Basic Projectile',
  tier: 1,
  trigger: SkillTrigger.OnTimer,
  carrier: SkillCarrier.Projectile,
  form: SkillForm.Straight,
  effects: [{ type: EffectType.Damage, value: 25 }],
  modifiers: [
    { type: ModifierType.Speed, value: 18 },
    { type: ModifierType.Duration, value: 1.5 },
  ],
  costs: [],
  visual: { color: 0xffd166, scale: 0.18 },
  cooldown: 0.65,
  range: 10,
}

export const EXPLOSION_SKILL: SkillDefinition = {
  id: 'explosion',
  name: 'Explosion',
  tier: 1,
  trigger: SkillTrigger.OnHit,
  carrier: SkillCarrier.Projectile,
  form: SkillForm.Burst,
  effects: [{ type: EffectType.Damage, value: 18 }],
  modifiers: [{ type: ModifierType.Radius, value: 2.6 }],
  costs: [],
  visual: { color: 0xff7b3e, accentColor: 0xffd166, opacity: 0.48 },
}

export const MAGMA_SKILL: SkillDefinition = {
  id: 'magma',
  name: 'Magma',
  tier: 1,
  trigger: SkillTrigger.OnHit,
  carrier: SkillCarrier.Zone,
  form: SkillForm.Persistent,
  effects: [
    { type: EffectType.DamageOverTime, value: 8, duration: 1.2, interval: 0.4 },
    { type: EffectType.Slow, value: 0.55, duration: 0.65 },
  ],
  modifiers: [
    { type: ModifierType.Radius, value: 2.4 },
    { type: ModifierType.Duration, value: 4 },
  ],
  costs: [],
  visual: { color: 0xe9472f, accentColor: 0xff9f1c, opacity: 0.42 },
  cooldown: 0.35,
}

export const ORBIT_FLAME_SKILL: SkillDefinition = {
  id: 'orbit-flame',
  name: 'Orbit Flame',
  tier: 1,
  trigger: SkillTrigger.OnTimer,
  carrier: SkillCarrier.Player,
  form: SkillForm.Orbit,
  effects: [{ type: EffectType.DamageOverTime, value: 6, duration: 0.75, interval: 0.3 }],
  modifiers: [
    { type: ModifierType.Radius, value: 2.8 },
    { type: ModifierType.Speed, value: 1.8 },
  ],
  costs: [],
  visual: { color: 0xff9f1c, accentColor: 0xffd166, scale: 0.28 },
  cooldown: 0.2,
  count: 3,
}

export const CORE_SKILL_DEFINITIONS: readonly SkillDefinition[] = [
  BASIC_PROJECTILE_SKILL,
  EXPLOSION_SKILL,
  MAGMA_SKILL,
  ORBIT_FLAME_SKILL,
]
