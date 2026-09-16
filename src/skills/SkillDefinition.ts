import type {
  CostType,
  EffectType,
  ModifierType,
  SkillCarrier,
  SkillForm,
  SkillTrigger,
} from './SkillEnums.ts'

export interface EffectDefinition {
  type: EffectType
  value: number
  duration?: number
  interval?: number
}

export interface ModifierDefinition {
  type: ModifierType
  value: number
}

export interface CostDefinition {
  type: CostType
  value: number
}

export interface SkillVisualDefinition {
  color: number
  accentColor?: number
  opacity?: number
  scale?: number
}

export interface SkillDefinition {
  id: string
  name: string
  tier: number
  trigger: SkillTrigger
  carrier: SkillCarrier
  form: SkillForm
  effects: readonly EffectDefinition[]
  modifiers: readonly ModifierDefinition[]
  costs: readonly CostDefinition[]
  visual: SkillVisualDefinition
  cooldown?: number
  range?: number
  count?: number
}
