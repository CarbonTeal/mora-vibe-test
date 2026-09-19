import { ALL_ELEMENTS, ElementType as E, type ElementType } from '../../elements/ElementType.ts'
import type {
  SecondaryBehaviour,
  SkillDefinition,
  Tier3CouplingTrigger,
  Tier4SignatureConfig,
  Tier4SignatureEffect,
  Tier4TriggerSource,
} from '../SkillDefinition.ts'
import { TIER_3_SKILLS } from './tier3Skills.ts'

interface Tier4Spec {
  baseTier3Id: string
  requiredElement: ElementType
  displayName: string
  triggerSource: Tier4TriggerSource
  triggerEvent: Tier3CouplingTrigger
  triggerThreshold: number
  cooldown: number
  activeObjectCap: number
  generationCap: number
  signatureEffects: readonly Tier4SignatureEffect[]
}

export interface Tier4Definition extends SkillDefinition {
  tier: 4
  baseTier3Id: string
  requiredElement: ElementType
  tier4DisplayName: string
  tier4Signature: Tier4SignatureConfig
}

/**
 * Architecture-phase sample set. The final content pass should raise the
 * enforced count to TIER_4_FINAL_EXPECTED_COUNT after adding the other 39 specs.
 */
export const TIER_4_FINAL_EXPECTED_COUNT = 45

const S: readonly Tier4Spec[] = [
  {
    baseTier3Id: 'tier3-wave',
    requiredElement: E.Dark,
    displayName: '深海潜艇',
    triggerSource: 'Primary',
    triggerEvent: 'OnPrimaryCast',
    triggerThreshold: 2,
    cooldown: 1.5,
    activeObjectCap: 10,
    generationCap: 6,
    signatureEffects: [{
      behaviour: 'HomingProjectile',
      count: 3,
      damageScale: 0.28,
      impactEffects: [{ behaviour: 'Burst', damageScale: 0.38, radiusScale: 1.45 }],
    }],
  },
  {
    baseTier3Id: 'tier3-steel',
    requiredElement: E.Light,
    displayName: '轨道轰炸',
    triggerSource: 'Tier3Secondary',
    triggerEvent: 'OnPrimaryOrbitContact',
    triggerThreshold: 2,
    cooldown: 2.2,
    activeObjectCap: 12,
    generationCap: 8,
    signatureEffects: [
      { behaviour: 'Rain', count: 5, damageScale: 0.24, radiusScale: 1.35 },
      { behaviour: 'Burst', count: 1, damageScale: 0.3, radiusScale: 1.2 },
    ],
  },
  {
    baseTier3Id: 'tier3-black-hole',
    requiredElement: E.Light,
    displayName: '活动星系核',
    triggerSource: 'Primary',
    triggerEvent: 'OnPrimaryZoneTick',
    triggerThreshold: 4,
    cooldown: 2.4,
    activeObjectCap: 8,
    generationCap: 5,
    signatureEffects: [
      { behaviour: 'Orbit', count: 4, damageScale: 0.2, radiusScale: 1.2, durationScale: 0.8 },
      { behaviour: 'Pulse', damageScale: 0.36, radiusScale: 1.5 },
    ],
  },
  {
    baseTier3Id: 'tier3-dusk',
    requiredElement: E.Dark,
    displayName: '永夜',
    triggerSource: 'Tier3Secondary',
    triggerEvent: 'OnPrimaryCast',
    triggerThreshold: 2,
    cooldown: 2,
    activeObjectCap: 8,
    generationCap: 4,
    signatureEffects: [
      { behaviour: 'Zone', damageScale: 0.22, radiusScale: 1.8, durationScale: 1.15 },
      { behaviour: 'Pulse', damageScale: 0.3, radiusScale: 1.4 },
    ],
  },
  {
    baseTier3Id: 'tier3-fog',
    requiredElement: E.Light,
    displayName: '海市蜃楼',
    triggerSource: 'Tier3Secondary',
    triggerEvent: 'OnPrimaryZoneTick',
    triggerThreshold: 2,
    cooldown: 1.8,
    activeObjectCap: 8,
    generationCap: 4,
    signatureEffects: [{ behaviour: 'DelayedEcho', count: 2, damageScale: 0.3, durationScale: 0.8 }],
  },
  {
    baseTier3Id: 'tier3-star',
    requiredElement: E.Dark,
    displayName: '灭绝彗星',
    triggerSource: 'Tier3Secondary',
    triggerEvent: 'OnPrimaryOrbitContact',
    triggerThreshold: 1,
    cooldown: 1.8,
    activeObjectCap: 9,
    generationCap: 5,
    signatureEffects: [{
      behaviour: 'Charge',
      count: 1,
      damageScale: 0.42,
      radiusScale: 1.35,
      impactEffects: [
        { behaviour: 'Burst', damageScale: 0.45, radiusScale: 1.7 },
      ],
    }],
  },
]

const byTier3 = new Map(TIER_3_SKILLS.map((definition) => [definition.id, definition]))

export const TIER_4_SKILLS: readonly Tier4Definition[] = S.map((spec) => {
  const base = byTier3.get(spec.baseTier3Id)
  if (!base) throw new Error(`Tier4 references missing Tier3: ${spec.baseTier3Id}`)
  return {
    ...base,
    id: `tier4-${base.baseTier2Id}`,
    name: `${base.name.split('：')[0]}：${spec.displayName}`,
    tier: 4,
    baseTier3Id: base.id,
    requiredElement: spec.requiredElement,
    specialName: spec.displayName,
    tier4DisplayName: spec.displayName,
    tier4Signature: {
      triggerSource: spec.triggerSource,
      triggerEvent: spec.triggerEvent,
      triggerThreshold: spec.triggerThreshold,
      cooldown: spec.cooldown,
      activeObjectCap: spec.activeObjectCap,
      generationCap: spec.generationCap,
      effects: spec.signatureEffects,
    },
  }
})

const SUPPORTED_SIGNATURE_BEHAVIOURS = new Set<SecondaryBehaviour>([
  'Burst', 'Zone', 'Wave', 'WideWave', 'Pulse', 'DarkPulse', 'Beam', 'BeamPulse',
  'BeamRefraction', 'Rain', 'Pull', 'ChainArc', 'Shard', 'MovingAura', 'MovingZone',
  'MovingWall', 'TrailZone', 'FissureZone', 'BurnZone', 'ExpandingZone', 'FreezeWave',
  'HomingProjectile', 'Charge', 'Summon', 'Swarm', 'Decoy', 'Refraction', 'Mark',
  'SpreadStatus', 'Flare', 'DashClone', 'Orbit', 'DelayedEcho',
])

function validateEffect(effect: Tier4SignatureEffect, definitionId: string): void {
  if (!SUPPORTED_SIGNATURE_BEHAVIOURS.has(effect.behaviour)) {
    throw new Error(`Unsupported Tier4 signature behaviour ${effect.behaviour}: ${definitionId}`)
  }
  for (const impact of effect.impactEffects ?? []) validateEffect(impact, definitionId)
}

function estimatedGeneration(effect: Tier4SignatureEffect): number {
  const count = Math.max(1, effect.count ?? 1)
  return count * (1 + (effect.impactEffects ?? []).reduce((sum, impact) => sum + estimatedGeneration(impact), 0))
}

export function validateTier4Definitions(): void {
  const ids = new Set<string>()
  const bases = new Set<string>()
  for (const definition of TIER_4_SKILLS) {
    if (ids.has(definition.id)) throw new Error(`Duplicate Tier4 id: ${definition.id}`)
    if (bases.has(definition.baseTier3Id)) throw new Error(`Duplicate Tier4 base: ${definition.baseTier3Id}`)
    ids.add(definition.id)
    bases.add(definition.baseTier3Id)
    const base = byTier3.get(definition.baseTier3Id)
    if (!base) throw new Error(`Invalid Tier4 base: ${definition.id}`)
    if (!ALL_ELEMENTS.includes(definition.requiredElement)) throw new Error(`Invalid Tier4 element: ${definition.id}`)
    if (!definition.tier4DisplayName || definition.tier4Signature.effects.length === 0) throw new Error(`Incomplete Tier4: ${definition.id}`)
    if (definition.attackMode !== base.attackMode || definition.baseTier2Id !== base.baseTier2Id) {
      throw new Error(`Tier4 must inherit Tier3 attack identity: ${definition.id}`)
    }
    definition.tier4Signature.effects.forEach((effect) => validateEffect(effect, definition.id))
    const estimatedObjects = definition.tier4Signature.effects.reduce((sum, effect) => sum + estimatedGeneration(effect), 0)
    if (estimatedObjects > definition.tier4Signature.generationCap) {
      throw new Error(`Tier4 signature exceeds generation cap (${estimatedObjects}/${definition.tier4Signature.generationCap}): ${definition.id}`)
    }
  }
}

validateTier4Definitions()

export const TIER_4_BY_BASE_TIER3 = new Map(
  TIER_4_SKILLS.map((definition) => [definition.baseTier3Id, definition]),
)
