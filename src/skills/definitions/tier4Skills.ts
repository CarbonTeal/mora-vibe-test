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
  // Final content pass: one destiny configuration for every remaining Tier3 build.
  { baseTier3Id: 'tier3-steam', requiredElement: E.Light, displayName: '光压炮', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.2, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Beam', damageScale: .6, radiusScale: 1.15 }, { behaviour: 'Burst', damageScale: .3, radiusScale: 1.3 }] },
  { baseTier3Id: 'tier3-boil', requiredElement: E.Earth, displayName: '超压喷泉', triggerSource: 'Primary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.5, activeObjectCap: 8, generationCap: 3, signatureEffects: [{ behaviour: 'Burst', count: 3, damageScale: .35, radiusScale: 1.2 }] },
  { baseTier3Id: 'tier3-cloud', requiredElement: E.Dark, displayName: '黑雷暴', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 3, cooldown: 2.3, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'ChainArc', damageScale: .45, radiusScale: 1.35 }, { behaviour: 'Burst', damageScale: .25, radiusScale: 1.15 }] },
  { baseTier3Id: 'tier3-explosion', requiredElement: E.Light, displayName: '光爆震', triggerSource: 'Primary', triggerEvent: 'OnPrimaryBurst', triggerThreshold: 2, cooldown: 2, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Wave', damageScale: .45, radiusScale: 1.4 }, { behaviour: 'Burst', damageScale: .35, radiusScale: 1.25 }] },
  { baseTier3Id: 'tier3-magma', requiredElement: E.Dark, displayName: '地狱熔炉', triggerSource: 'Primary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.6, activeObjectCap: 10, generationCap: 6, signatureEffects: [{ behaviour: 'Shard', count: 5, damageScale: .3 }, { behaviour: 'Zone', damageScale: .25, radiusScale: 1.25, durationScale: .8 }] },
  { baseTier3Id: 'tier3-ash', requiredElement: E.Wind, displayName: '天灾沙暴', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 2, cooldown: 2.5, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Wave', damageScale: .45, radiusScale: 1.5 }, { behaviour: 'MovingAura', damageScale: .2, radiusScale: 1.25 }] },
  { baseTier3Id: 'tier3-wildfire', requiredElement: E.Dark, displayName: '炼狱', triggerSource: 'Primary', triggerEvent: 'OnPrimaryKill', triggerThreshold: 2, cooldown: 1.8, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Burst', damageScale: .45, radiusScale: 1.25 }, { behaviour: 'Zone', damageScale: .25, radiusScale: 1.2, durationScale: .75 }] },
  { baseTier3Id: 'tier3-smoke', requiredElement: E.Water, displayName: '腐蚀云雨', triggerSource: 'Tier3Secondary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.6, activeObjectCap: 10, generationCap: 4, signatureEffects: [{ behaviour: 'Zone', damageScale: .3, radiusScale: 1.4 }, { behaviour: 'Rain', count: 3, damageScale: .2 }] },
  { baseTier3Id: 'tier3-burning-wind', requiredElement: E.Light, displayName: '日珥风暴', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 2, cooldown: 2.4, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Pulse', damageScale: .35, radiusScale: 1.35 }, { behaviour: 'Wave', damageScale: .4, radiusScale: 1.35 }] },
  { baseTier3Id: 'tier3-flame', requiredElement: E.Light, displayName: '聚变喷流', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 4, cooldown: 2.2, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Beam', damageScale: .65, radiusScale: 1.1 }, { behaviour: 'Burst', damageScale: .2 }] },
  { baseTier3Id: 'tier3-sun', requiredElement: E.Dark, displayName: '黑日', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.5, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Pull', damageScale: .35, radiusScale: 1.5 }, { behaviour: 'Pulse', damageScale: .5, radiusScale: 1.4 }] },
  { baseTier3Id: 'tier3-wisp-flame', requiredElement: E.Earth, displayName: '地核裂变', triggerSource: 'Primary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.5, activeObjectCap: 10, generationCap: 5, signatureEffects: [{ behaviour: 'Shard', count: 4, damageScale: .25 }, { behaviour: 'Burst', damageScale: .4, radiusScale: 1.3 }] },
  { baseTier3Id: 'tier3-ember', requiredElement: E.Light, displayName: '不死鸟', triggerSource: 'Primary', triggerEvent: 'OnPrimaryKill', triggerThreshold: 2, cooldown: 3, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Summon', count: 2, damageScale: .3, durationScale: .8 }] },
  { baseTier3Id: 'tier3-ghost-fire', requiredElement: E.Dark, displayName: '万鬼夜行', triggerSource: 'Tier3Secondary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.8, activeObjectCap: 12, generationCap: 6, signatureEffects: [{ behaviour: 'DelayedEcho', count: 2, damageScale: .25 }, { behaviour: 'HomingProjectile', count: 4, damageScale: .25 }] },
  { baseTier3Id: 'tier3-mud', requiredElement: E.Earth, displayName: '兵马俑', triggerSource: 'Tier3Secondary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 3.2, activeObjectCap: 8, generationCap: 4, signatureEffects: [{ behaviour: 'Summon', count: 3, damageScale: .25, durationScale: .8 }, { behaviour: 'Pulse', damageScale: .2, radiusScale: 1.2 }] },
  { baseTier3Id: 'tier3-spring', requiredElement: E.Wind, displayName: '龙吸水', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 2, cooldown: 2.6, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Pull', damageScale: .35, radiusScale: 1.6 }, { behaviour: 'Burst', damageScale: .4, radiusScale: 1.3 }] },
  { baseTier3Id: 'tier3-swamp', requiredElement: E.Fire, displayName: '沼泽火海', triggerSource: 'Primary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.3, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Burst', damageScale: .4, radiusScale: 1.35 }, { behaviour: 'Zone', damageScale: .3, radiusScale: 1.25 }] },
  { baseTier3Id: 'tier3-rain', requiredElement: E.Dark, displayName: '灭世洪灾', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 3, cooldown: 3, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Wave', damageScale: .55, radiusScale: 1.7 }, { behaviour: 'Pull', damageScale: .3, radiusScale: 1.35 }] },
  { baseTier3Id: 'tier3-ice', requiredElement: E.Light, displayName: '极光冰原', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.5, activeObjectCap: 10, generationCap: 5, signatureEffects: [{ behaviour: 'Pulse', damageScale: .35, radiusScale: 1.35 }, { behaviour: 'Shard', count: 4, damageScale: .25 }] },
  { baseTier3Id: 'tier3-rainbow', requiredElement: E.Light, displayName: '光谱阵列', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.3, activeObjectCap: 10, generationCap: 4, signatureEffects: [{ behaviour: 'Beam', count: 4, damageScale: .28, radiusScale: 1.25 }] },
  { baseTier3Id: 'tier3-snow', requiredElement: E.Dark, displayName: '极夜暴雪', triggerSource: 'Primary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.8, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Zone', damageScale: .3, radiusScale: 1.6 }, { behaviour: 'Pulse', damageScale: .3, radiusScale: 1.35 }] },
  { baseTier3Id: 'tier3-poison', requiredElement: E.Dark, displayName: '瘟疫云团', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 4, cooldown: 2.5, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Zone', damageScale: .3, radiusScale: 1.45 }, { behaviour: 'Burst', damageScale: .25 }] },
  { baseTier3Id: 'tier3-ink', requiredElement: E.Dark, displayName: '禁忌烙印', triggerSource: 'Primary', triggerEvent: 'OnPrimaryKill', triggerThreshold: 2, cooldown: 2.3, activeObjectCap: 8, generationCap: 3, signatureEffects: [{ behaviour: 'DelayedEcho', count: 2, damageScale: .25 }, { behaviour: 'Burst', damageScale: .45, radiusScale: 1.3 }] },
  { baseTier3Id: 'tier3-acid', requiredElement: E.Light, displayName: '等离子电解', triggerSource: 'Tier3Secondary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.2, activeObjectCap: 8, generationCap: 3, signatureEffects: [{ behaviour: 'ChainArc', damageScale: .35, radiusScale: 1.25 }, { behaviour: 'ChainArc', count: 2, damageScale: .25 }] },
  { baseTier3Id: 'tier3-sand', requiredElement: E.Light, displayName: '光学晶阵', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.4, activeObjectCap: 10, generationCap: 5, signatureEffects: [{ behaviour: 'Shard', count: 4, damageScale: .25 }, { behaviour: 'Refraction', damageScale: .2 }] },
  { baseTier3Id: 'tier3-dust', requiredElement: E.Fire, displayName: '连锁粉尘爆轰', triggerSource: 'Primary', triggerEvent: 'OnPrimaryBurst', triggerThreshold: 2, cooldown: 2, activeObjectCap: 8, generationCap: 3, signatureEffects: [{ behaviour: 'Burst', count: 3, damageScale: .33, radiusScale: 1.25 }] },
  { baseTier3Id: 'tier3-sandstorm', requiredElement: E.Earth, displayName: '大陆崩塌', triggerSource: 'Primary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.8, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Wave', damageScale: .45, radiusScale: 1.65 }, { behaviour: 'Burst', damageScale: .35, radiusScale: 1.35 }] },
  { baseTier3Id: 'tier3-crystal', requiredElement: E.Light, displayName: '歼星激光', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 4, cooldown: 2.6, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Beam', damageScale: .7, radiusScale: 1.35 }, { behaviour: 'Burst', damageScale: .3 }] },
  { baseTier3Id: 'tier3-mirror', requiredElement: E.Light, displayName: '戴森镜阵', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 3, activeObjectCap: 10, generationCap: 4, signatureEffects: [{ behaviour: 'Orbit', count: 3, damageScale: .25, radiusScale: 1.2, durationScale: .8 }, { behaviour: 'Beam', damageScale: .3 }] },
  { baseTier3Id: 'tier3-coal', requiredElement: E.Fire, displayName: '重型火炮', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.3, activeObjectCap: 10, generationCap: 5, signatureEffects: [{ behaviour: 'Burst', damageScale: .6, radiusScale: 1.4 }, { behaviour: 'Shard', count: 4, damageScale: .22 }] },
  { baseTier3Id: 'tier3-gravity', requiredElement: E.Dark, displayName: '引力井', triggerSource: 'Primary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.8, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Pull', damageScale: .35, radiusScale: 1.7 }, { behaviour: 'Pulse', damageScale: .45, radiusScale: 1.5 }] },
  { baseTier3Id: 'tier3-glow', requiredElement: E.Fire, displayName: '焚天', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 2, cooldown: 2.5, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Wave', damageScale: .4, radiusScale: 1.6 }, { behaviour: 'Zone', damageScale: .25, radiusScale: 1.35 }] },
  { baseTier3Id: 'tier3-halo', requiredElement: E.Light, displayName: '恒星日冕', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 3, cooldown: 2.6, activeObjectCap: 10, generationCap: 4, signatureEffects: [{ behaviour: 'Pulse', damageScale: .35, radiusScale: 1.4 }, { behaviour: 'Beam', count: 3, damageScale: .17 }] },
  { baseTier3Id: 'tier3-aurora', requiredElement: E.Dark, displayName: '电磁风暴', triggerSource: 'Tier3Secondary', triggerEvent: 'OnPrimaryZoneTick', triggerThreshold: 3, cooldown: 2.6, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'ChainArc', damageScale: .35, radiusScale: 1.3 }, { behaviour: 'Zone', damageScale: .25, radiusScale: 1.3 }] },
  { baseTier3Id: 'tier3-miasma', requiredElement: E.Dark, displayName: '大瘟疫', triggerSource: 'Primary', triggerEvent: 'OnPrimaryKill', triggerThreshold: 2, cooldown: 2.3, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Zone', damageScale: .3, radiusScale: 1.35 }, { behaviour: 'Burst', damageScale: .25 }] },
  { baseTier3Id: 'tier3-soul', requiredElement: E.Light, displayName: '灵魂军团', triggerSource: 'Tier3Secondary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 3, activeObjectCap: 8, generationCap: 3, signatureEffects: [{ behaviour: 'Summon', count: 3, damageScale: .25, durationScale: .8 }] },
  { baseTier3Id: 'tier3-void', requiredElement: E.Dark, displayName: '真空坍缩', triggerSource: 'Primary', triggerEvent: 'OnPrimaryHit', triggerThreshold: 3, cooldown: 2.5, activeObjectCap: 8, generationCap: 2, signatureEffects: [{ behaviour: 'Pull', damageScale: .35, radiusScale: 1.35 }, { behaviour: 'Burst', damageScale: .55, radiusScale: 1.4 }] },
  { baseTier3Id: 'tier3-dawn', requiredElement: E.Light, displayName: '恒星诞生', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 3, cooldown: 2.8, activeObjectCap: 8, generationCap: 3, signatureEffects: [{ behaviour: 'Pulse', damageScale: .4, radiusScale: 1.35 }, { behaviour: 'Beam', count: 2, damageScale: .25 }] },
  { baseTier3Id: 'tier3-shadow', requiredElement: E.Dark, displayName: '暗影军团', triggerSource: 'Primary', triggerEvent: 'OnPrimaryCast', triggerThreshold: 3, cooldown: 2.6, activeObjectCap: 8, generationCap: 3, signatureEffects: [{ behaviour: 'DelayedEcho', count: 3, damageScale: .28 }] },
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
  if (TIER_3_SKILLS.length !== TIER_4_FINAL_EXPECTED_COUNT) {
    throw new Error(`Tier4 expects ${TIER_4_FINAL_EXPECTED_COUNT} Tier3 definitions, found ${TIER_3_SKILLS.length}`)
  }
  if (TIER_4_SKILLS.length !== TIER_4_FINAL_EXPECTED_COUNT) {
    throw new Error(`Tier4 expects exactly ${TIER_4_FINAL_EXPECTED_COUNT} definitions, found ${TIER_4_SKILLS.length}`)
  }
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
  if (bases.size !== TIER_4_FINAL_EXPECTED_COUNT) {
    throw new Error(`Tier4 must map exactly ${TIER_4_FINAL_EXPECTED_COUNT} unique Tier3 definitions`)
  }
  for (const base of TIER_3_SKILLS) {
    if (!bases.has(base.id)) throw new Error(`Tier3 missing Tier4 definition: ${base.id}`)
  }
}

validateTier4Definitions()

export const TIER_4_BY_BASE_TIER3 = new Map(
  TIER_4_SKILLS.map((definition) => [definition.baseTier3Id, definition]),
)
