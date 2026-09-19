import type {
  CostType,
  EffectType,
  ModifierType,
  SkillCarrier,
  SkillForm,
  SkillTrigger,
  SkillBehaviour,
} from './SkillEnums.ts'
import type { ElementType } from '../elements/ElementType.ts'

export type SecondaryBehaviour =
  | 'Burst' | 'Zone' | 'Wave' | 'WideWave' | 'Pulse' | 'DarkPulse'
  | 'Beam' | 'BeamPulse' | 'BeamRefraction' | 'Rain' | 'Pull'
  | 'ChainArc' | 'Shard' | 'MovingAura' | 'MovingZone' | 'MovingWall'
  | 'TrailZone' | 'FissureZone' | 'BurnZone' | 'ExpandingZone'
  | 'FreezeWave' | 'HomingProjectile' | 'Charge' | 'Summon' | 'Swarm'
  | 'Decoy' | 'Refraction' | 'Mark' | 'SpreadStatus' | 'Flare' | 'DashClone'
  | 'Orbit' | 'DelayedEcho'

export type Tier3CouplingTrigger =
  | 'OnPrimaryCast'
  | 'OnPrimaryHit'
  | 'OnPrimaryZoneTick'
  | 'OnPrimaryBurst'
  | 'OnPrimaryOrbitContact'
  | 'OnPrimaryKill'

export type EvolutionAttackMode = 'weaponModifier' | 'weaponReplacement' | 'additive'

export interface WeaponStatInheritance {
  damage: boolean
  attackSpeed: boolean
  range?: boolean
  projectileSpeed?: boolean
  pierce?: boolean
  pelletCount?: boolean
}

export interface Tier3SecondaryConfig {
  couplingTrigger: Tier3CouplingTrigger
  cooldown: number
  triggerThreshold: number
  damageScale: number
  radiusScale?: number
  durationScale?: number
  maxActive: number
  generationCap: number
}

export type Tier4TriggerSource = 'Primary' | 'Tier3Secondary'

export interface Tier4SignatureEffect {
  behaviour: SecondaryBehaviour
  count?: number
  damageScale?: number
  radiusScale?: number
  durationScale?: number
  impactEffects?: readonly Tier4SignatureEffect[]
}

export interface Tier4SignatureConfig {
  triggerSource: Tier4TriggerSource
  triggerEvent: Tier3CouplingTrigger
  triggerThreshold: number
  cooldown: number
  activeObjectCap: number
  generationCap: number
  effects: readonly Tier4SignatureEffect[]
}

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
  shape?: 'sphere' | 'blade' | 'curtain'
}

export interface SkillDefinition {
  id: string
  name: string
  tier: number
  trigger: SkillTrigger
  carrier: SkillCarrier
  form: SkillForm
  behaviour?: SkillBehaviour
  effects: readonly EffectDefinition[]
  modifiers: readonly ModifierDefinition[]
  costs: readonly CostDefinition[]
  visual: SkillVisualDefinition
  cooldown?: number
  range?: number
  count?: number
  eliteBossDamageMultiplier?: number
  displayGlyph?: string
  deathBurstRadius?: number
  baseTier2Id?: string
  requiredElement?: ElementType
  specialName?: string
  primaryBehaviour?: SkillBehaviour
  secondaryBehaviour?: SecondaryBehaviour
  secondaryConfig?: Tier3SecondaryConfig
  baseTier3Id?: string
  tier4DisplayName?: string
  tier4Signature?: Tier4SignatureConfig
  attackMode?: EvolutionAttackMode
  weaponStatInheritance?: WeaponStatInheritance
}
