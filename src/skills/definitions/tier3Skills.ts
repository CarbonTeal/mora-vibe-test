import { ALL_ELEMENTS, ElementType as E } from '../../elements/ElementType.ts'
import type { ElementType } from '../../elements/ElementType.ts'
import type { SecondaryBehaviour, SkillDefinition, Tier3CouplingTrigger } from '../SkillDefinition.ts'
import { SkillBehaviour } from '../SkillEnums.ts'
import { TIER_2_SKILLS } from './evolutionSkills.ts'

interface Tier3Spec {
  baseTier2Id: string
  requiredElement: ElementType
  specialName: string
  secondaryBehaviour: SecondaryBehaviour
}

export interface Tier3Definition extends SkillDefinition {
  tier: 3
  baseTier2Id: string
  requiredElement: ElementType
  specialName: string
  primaryBehaviour: NonNullable<SkillDefinition['behaviour']>
  secondaryBehaviour: SecondaryBehaviour
  secondaryConfig: NonNullable<SkillDefinition['secondaryConfig']>
}

const S: readonly Tier3Spec[] = [
  { baseTier2Id: 'steam', requiredElement: E.Wind, specialName: '蒸汽炮', secondaryBehaviour: 'Burst' },
  { baseTier2Id: 'boil', requiredElement: E.Earth, specialName: '间歇泉', secondaryBehaviour: 'Pulse' },
  { baseTier2Id: 'cloud', requiredElement: E.Light, specialName: '雷云', secondaryBehaviour: 'ChainArc' },
  { baseTier2Id: 'explosion', requiredElement: E.Wind, specialName: '冲击波', secondaryBehaviour: 'Wave' },
  { baseTier2Id: 'magma', requiredElement: E.Water, specialName: '黑曜石', secondaryBehaviour: 'Shard' },
  { baseTier2Id: 'ash', requiredElement: E.Wind, specialName: '灰暴', secondaryBehaviour: 'MovingAura' },
  { baseTier2Id: 'wildfire', requiredElement: E.Earth, specialName: '火海', secondaryBehaviour: 'Zone' },
  { baseTier2Id: 'smoke', requiredElement: E.Water, specialName: '酸雨', secondaryBehaviour: 'Rain' },
  { baseTier2Id: 'burning-wind', requiredElement: E.Light, specialName: '太阳风', secondaryBehaviour: 'WideWave' },
  { baseTier2Id: 'flame', requiredElement: E.Wind, specialName: '火焰喷射器', secondaryBehaviour: 'TrailZone' },
  { baseTier2Id: 'sun', requiredElement: E.Dark, specialName: '日蚀', secondaryBehaviour: 'DarkPulse' },
  { baseTier2Id: 'star', requiredElement: E.Wind, specialName: '彗星', secondaryBehaviour: 'Charge' },
  { baseTier2Id: 'wisp-flame', requiredElement: E.Earth, specialName: '地火', secondaryBehaviour: 'FissureZone' },
  { baseTier2Id: 'ember', requiredElement: E.Light, specialName: '凤凰', secondaryBehaviour: 'Summon' },
  { baseTier2Id: 'ghost-fire', requiredElement: E.Wind, specialName: '百鬼夜行', secondaryBehaviour: 'Swarm' },
  { baseTier2Id: 'mud', requiredElement: E.Fire, specialName: '陶俑', secondaryBehaviour: 'Summon' },
  { baseTier2Id: 'spring', requiredElement: E.Wind, specialName: '水龙卷', secondaryBehaviour: 'MovingZone' },
  { baseTier2Id: 'swamp', requiredElement: E.Fire, specialName: '沼气爆燃', secondaryBehaviour: 'Burst' },
  { baseTier2Id: 'fog', requiredElement: E.Light, specialName: '蜃景', secondaryBehaviour: 'Decoy' },
  { baseTier2Id: 'rain', requiredElement: E.Earth, specialName: '洪水', secondaryBehaviour: 'ExpandingZone' },
  { baseTier2Id: 'wave', requiredElement: E.Earth, specialName: '海啸', secondaryBehaviour: 'Pull' },
  { baseTier2Id: 'ice', requiredElement: E.Earth, specialName: '冰川', secondaryBehaviour: 'MovingWall' },
  { baseTier2Id: 'rainbow', requiredElement: E.Earth, specialName: '棱镜', secondaryBehaviour: 'Refraction' },
  { baseTier2Id: 'snow', requiredElement: E.Wind, specialName: '暴雪', secondaryBehaviour: 'FreezeWave' },
  { baseTier2Id: 'poison', requiredElement: E.Wind, specialName: '毒雾', secondaryBehaviour: 'Zone' },
  { baseTier2Id: 'ink', requiredElement: E.Fire, specialName: '烙印', secondaryBehaviour: 'Mark' },
  { baseTier2Id: 'acid', requiredElement: E.Light, specialName: '电解', secondaryBehaviour: 'ChainArc' },
  { baseTier2Id: 'sand', requiredElement: E.Fire, specialName: '玻璃', secondaryBehaviour: 'Shard' },
  { baseTier2Id: 'dust', requiredElement: E.Fire, specialName: '粉尘爆炸', secondaryBehaviour: 'Burst' },
  { baseTier2Id: 'sandstorm', requiredElement: E.Water, specialName: '泥石流', secondaryBehaviour: 'Wave' },
  { baseTier2Id: 'crystal', requiredElement: E.Fire, specialName: '激光', secondaryBehaviour: 'Beam' },
  { baseTier2Id: 'mirror', requiredElement: E.Fire, specialName: '太阳炉', secondaryBehaviour: 'BurnZone' },
  { baseTier2Id: 'steel', requiredElement: E.Fire, specialName: '导弹发射器', secondaryBehaviour: 'HomingProjectile' },
  { baseTier2Id: 'coal', requiredElement: E.Fire, specialName: '火药', secondaryBehaviour: 'Burst' },
  { baseTier2Id: 'gravity', requiredElement: E.Light, specialName: '引力透镜', secondaryBehaviour: 'BeamRefraction' },
  { baseTier2Id: 'black-hole', requiredElement: E.Light, specialName: '类星体', secondaryBehaviour: 'BeamPulse' },
  { baseTier2Id: 'glow', requiredElement: E.Fire, specialName: '火烧云', secondaryBehaviour: 'BurnZone' },
  { baseTier2Id: 'halo', requiredElement: E.Fire, specialName: '日冕', secondaryBehaviour: 'Flare' },
  { baseTier2Id: 'aurora', requiredElement: E.Earth, specialName: '磁暴', secondaryBehaviour: 'ChainArc' },
  { baseTier2Id: 'miasma', requiredElement: E.Water, specialName: '瘟疫', secondaryBehaviour: 'SpreadStatus' },
  { baseTier2Id: 'soul', requiredElement: E.Earth, specialName: '傀儡', secondaryBehaviour: 'Summon' },
  { baseTier2Id: 'void', requiredElement: E.Fire, specialName: '湮灭', secondaryBehaviour: 'Burst' },
  { baseTier2Id: 'dusk', requiredElement: E.Fire, specialName: '落日', secondaryBehaviour: 'Beam' },
  { baseTier2Id: 'dawn', requiredElement: E.Fire, specialName: '旭日', secondaryBehaviour: 'Beam' },
  { baseTier2Id: 'shadow', requiredElement: E.Wind, specialName: '残影', secondaryBehaviour: 'DashClone' },
]

const byTier2 = new Map(TIER_2_SKILLS.map((definition) => [definition.id, definition]))

const COUPLING_OVERRIDES: Readonly<Record<string, Partial<{
  couplingTrigger: Tier3CouplingTrigger
  triggerThreshold: number
  cooldown: number
  generationCap: number
}>>> = {
  star: { couplingTrigger: 'OnPrimaryOrbitContact', triggerThreshold: 3, cooldown: 0.8 },
  magma: { couplingTrigger: 'OnPrimaryZoneTick', triggerThreshold: 1, cooldown: 0.7 },
  'black-hole': { couplingTrigger: 'OnPrimaryZoneTick', triggerThreshold: 2, cooldown: 0.8, generationCap: 3 },
  poison: { couplingTrigger: 'OnPrimaryHit', triggerThreshold: 2, cooldown: 0.55 },
  rain: { couplingTrigger: 'OnPrimaryCast', triggerThreshold: 1, cooldown: 0.15 },
  ice: { couplingTrigger: 'OnPrimaryHit', triggerThreshold: 2, cooldown: 0.65 },
  dusk: { couplingTrigger: 'OnPrimaryCast', triggerThreshold: 1, cooldown: 0.1, generationCap: 4 },
  ember: { couplingTrigger: 'OnPrimaryKill', triggerThreshold: 1, cooldown: 0.4 },
}

function defaultCouplingTrigger(behaviour: SkillBehaviour): Tier3CouplingTrigger {
  if (behaviour === SkillBehaviour.Orbit) return 'OnPrimaryOrbitContact'
  const zoneBehaviours: readonly SkillBehaviour[] = [SkillBehaviour.ZoneProjectile, SkillBehaviour.PullField, SkillBehaviour.Aura, SkillBehaviour.Trail]
  const hitBehaviours: readonly SkillBehaviour[] = [SkillBehaviour.Projectile, SkillBehaviour.Homing, SkillBehaviour.Ricochet, SkillBehaviour.Split, SkillBehaviour.Blink]
  if (zoneBehaviours.includes(behaviour)) return 'OnPrimaryZoneTick'
  if (behaviour === SkillBehaviour.BurstProjectile) return 'OnPrimaryBurst'
  if (hitBehaviours.includes(behaviour)) return 'OnPrimaryHit'
  return 'OnPrimaryCast'
}

export const TIER_3_SKILLS: readonly Tier3Definition[] = S.map((spec) => {
  const base = byTier2.get(spec.baseTier2Id)
  if (!base) throw new Error(`Tier3 references missing Tier2: ${spec.baseTier2Id}`)
  const coupling = COUPLING_OVERRIDES[base.id] ?? {}
  return {
    ...base,
    id: `tier3-${base.id}`,
    name: `${base.name.split('/')[0].trim()}：${spec.specialName}`,
    tier: 3,
    baseTier2Id: base.id,
    requiredElement: spec.requiredElement,
    specialName: spec.specialName,
    primaryBehaviour: base.behaviour!,
    secondaryBehaviour: spec.secondaryBehaviour,
    secondaryConfig: {
      couplingTrigger: coupling.couplingTrigger ?? defaultCouplingTrigger(base.behaviour!),
      cooldown: coupling.cooldown ?? 0.75,
      triggerThreshold: coupling.triggerThreshold ?? 1,
      damageScale: 0.34,
      radiusScale: 1.15,
      durationScale: 0.75,
      maxActive: 12,
      generationCap: coupling.generationCap ?? 2,
    },
  }
})

export function validateTier3Definitions(): void {
  const ids = new Set(TIER_3_SKILLS.map((definition) => definition.baseTier2Id))
  if (TIER_2_SKILLS.length !== 45 || TIER_3_SKILLS.length !== 45 || ids.size !== 45) {
    throw new Error(`Tier3 registry must map 45 unique Tier2 skills; got ${TIER_3_SKILLS.length}/${ids.size}`)
  }
  for (const definition of TIER_3_SKILLS) {
    if (!definition.baseTier2Id || !byTier2.has(definition.baseTier2Id)) throw new Error(`Invalid Tier3 base: ${definition.id}`)
    if (!definition.requiredElement || !ALL_ELEMENTS.includes(definition.requiredElement)) throw new Error(`Invalid Tier3 element: ${definition.id}`)
    if (!definition.specialName || !definition.primaryBehaviour || !definition.secondaryBehaviour) throw new Error(`Incomplete Tier3: ${definition.id}`)
    const base = byTier2.get(definition.baseTier2Id)!
    if (definition.attackMode !== base.attackMode) throw new Error(`Tier3 attack mode must inherit its base Tier2: ${definition.id}`)
    if (JSON.stringify(definition.weaponStatInheritance) !== JSON.stringify(base.weaponStatInheritance)) {
      throw new Error(`Tier3 weapon stat inheritance must match its base Tier2: ${definition.id}`)
    }
  }
}

validateTier3Definitions()

export const TIER_3_BY_BASE_TIER2 = new Map(
  TIER_3_SKILLS.map((definition) => [definition.baseTier2Id!, definition]),
)
