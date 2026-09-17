import { GAME_CONFIG } from '../../config/gameConfig.ts'
import type { EffectDefinition, ModifierDefinition, SkillDefinition } from '../SkillDefinition.ts'
import {
  EffectType as E,
  ModifierType as M,
  SkillBehaviour as B,
  SkillCarrier as C,
  SkillForm as F,
  SkillTrigger as T,
  type SkillBehaviour,
  type SkillCarrier,
  type SkillForm,
} from '../SkillEnums.ts'

interface SkillSpec {
  id: string
  name: string
  tier: number
  carrier: SkillCarrier
  form: SkillForm
  behaviour: SkillBehaviour
  effects: readonly EffectDefinition[]
  modifiers?: readonly ModifierDefinition[]
  color: number
  accent?: number
  cooldown?: number
  range?: number
  count?: number
  scale?: number
  opacity?: number
  shape?: 'sphere' | 'blade' | 'curtain'
  eliteBossDamageMultiplier?: number
  deathBurstRadius?: number
}

const skill = (spec: SkillSpec): SkillDefinition => ({
  id: spec.id,
  name: spec.name,
  tier: spec.tier,
  trigger: T.OnTimer,
  carrier: spec.carrier,
  form: spec.form,
  behaviour: spec.behaviour,
  effects: spec.effects,
  modifiers: spec.modifiers ?? [],
  costs: [],
  visual: {
    color: spec.color,
    accentColor: spec.accent,
    scale: spec.scale ?? 0.22,
    opacity: spec.opacity ?? 0.48,
    shape: spec.shape,
  },
  cooldown: spec.cooldown ?? 0.75,
  range: spec.range ?? 11,
  count: spec.count,
  eliteBossDamageMultiplier: spec.eliteBossDamageMultiplier,
  displayGlyph: spec.name.split('/')[1]?.trim(),
  deathBurstRadius: spec.deathBurstRadius,
})

const t1 = GAME_CONFIG.skills.tier1

export const TIER_1_SKILLS: readonly SkillDefinition[] = [
  skill({ id: 'element-fire', name: 'Fire / 火', tier: 1, carrier: C.Projectile, form: F.Straight, behaviour: B.Projectile, effects: [{ type: E.Damage, value: t1.damage }, { type: E.Burn, value: t1.fireBurnDamage, duration: t1.fireBurnDuration, interval: 0.45 }], modifiers: [{ type: M.Speed, value: 18 }], color: 0xff5a36, accent: 0xffc15c, cooldown: t1.cooldown, range: t1.range }),
  skill({ id: 'element-water', name: 'Water / 水', tier: 1, carrier: C.Projectile, form: F.Burst, behaviour: B.BurstProjectile, effects: [{ type: E.Damage, value: t1.waterSplashDamage }], modifiers: [{ type: M.Radius, value: t1.waterSplashRadius }], color: 0x3aa8ff, accent: 0xa9e5ff, cooldown: t1.cooldown, range: t1.range }),
  skill({ id: 'element-earth', name: 'Earth / 土', tier: 1, carrier: C.Projectile, form: F.Straight, behaviour: B.Projectile, effects: [{ type: E.Damage, value: t1.damage }, { type: E.Slow, value: t1.earthSlowMultiplier, duration: t1.earthSlowDuration }], color: 0xc99754, accent: 0xf1cc8f, cooldown: t1.cooldown, range: t1.range, scale: 0.27 }),
  skill({ id: 'element-wind', name: 'Wind / 风', tier: 1, carrier: C.Projectile, form: F.Straight, behaviour: B.Projectile, effects: [{ type: E.Damage, value: t1.damage }, { type: E.Knockback, value: t1.windKnockback }], modifiers: [{ type: M.Speed, value: t1.windProjectileSpeed }], color: 0x79e8bd, accent: 0xe1fff4, cooldown: t1.cooldown, range: t1.range }),
  skill({ id: 'element-light', name: 'Light / 光', tier: 1, carrier: C.Projectile, form: F.Pierce, behaviour: B.Projectile, effects: [{ type: E.Damage, value: t1.damage }], modifiers: [{ type: M.Pierce, value: t1.lightPierce }], color: 0xffef8b, accent: 0xffffff, cooldown: t1.cooldown, range: t1.range, eliteBossDamageMultiplier: 1.2 }),
  skill({ id: 'element-dark', name: 'Dark / 暗', tier: 1, carrier: C.Projectile, form: F.Straight, behaviour: B.Projectile, effects: [{ type: E.Damage, value: t1.damage }, { type: E.Heal, value: t1.darkLifeSteal }], color: 0x6d45a8, accent: 0xc29cff, cooldown: t1.cooldown, range: t1.range }),
]

export const TIER_2_SKILLS: readonly SkillDefinition[] = [
  skill({ id: 'steam', name: 'Steam / 蒸', tier: 2, carrier: C.Cone, form: F.Persistent, behaviour: B.Cone, effects: [{ type: E.Damage, value: 8 }, { type: E.Knockback, value: 0.25 }], modifiers: [{ type: M.Radius, value: 4.8 }], color: 0xc8f3f4, accent: 0xffaa72, cooldown: 0.34, range: 5 }),
  skill({ id: 'boil', name: 'Boil / 沸', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.DamageOverTime, value: 8, duration: 1.2, interval: 0.35 }], modifiers: [{ type: M.Radius, value: 2.2 }, { type: M.Duration, value: 4 }], color: 0x69cfff, accent: 0xff6a3d, cooldown: 0.8 }),
  skill({ id: 'cloud', name: 'Cloud / 云', tier: 2, carrier: C.PlayerAura, form: F.Rain, behaviour: B.Rain, effects: [{ type: E.Damage, value: 15 }, { type: E.Slow, value: 0.78, duration: 1 }], modifiers: [{ type: M.Radius, value: 5 }], color: 0xd8f1f2, accent: 0xff9a63, cooldown: 0.42 }),
  skill({ id: 'explosion', name: 'Explosion / 爆', tier: 2, carrier: C.Projectile, form: F.Burst, behaviour: B.BurstProjectile, effects: [{ type: E.Damage, value: 26 }], modifiers: [{ type: M.Radius, value: 2.8 }], color: 0xff7b3e, accent: 0xffd166, cooldown: 0.72 }),
  skill({ id: 'magma', name: 'Magma / 熔', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.DamageOverTime, value: 9, duration: 1.2, interval: 0.35 }, { type: E.Slow, value: 0.55, duration: 0.8 }], modifiers: [{ type: M.Radius, value: 2.5 }, { type: M.Duration, value: 4.5 }], color: 0xe9472f, accent: 0xff9f1c, cooldown: 0.8 }),
  skill({ id: 'ash', name: 'Ash / 灰', tier: 2, carrier: C.Cone, form: F.Persistent, behaviour: B.Cone, effects: [{ type: E.DamageOverTime, value: 7, duration: 1.8, interval: 0.6 }, { type: E.Slow, value: 0.65, duration: 1.4 }], modifiers: [{ type: M.Radius, value: 5.4 }], color: 0x8d8178, accent: 0xd66b3c, cooldown: 0.65, range: 5.5 }),
  skill({ id: 'wildfire', name: 'Wildfire / 燎', tier: 2, carrier: C.Projectile, form: F.Split, behaviour: B.Split, effects: [{ type: E.Damage, value: 15 }, { type: E.Burn, value: 5, duration: 2.5, interval: 0.4 }], modifiers: [{ type: M.Split, value: 3 }], color: 0xff522e, accent: 0xffd05a, cooldown: 0.62 }),
  skill({ id: 'smoke', name: 'Smoke / 烟', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.Slow, value: 0.62, duration: 1.2 }, { type: E.AttackRateDown, value: 0.55, duration: 1.2 }], modifiers: [{ type: M.Radius, value: 3 }, { type: M.Duration, value: 5 }], color: 0x55565e, accent: 0x9d9fa8, cooldown: 0.9 }),
  skill({ id: 'burning-wind', name: 'BurningWind / 焚', tier: 2, carrier: C.PlayerAura, form: F.Pulse, behaviour: B.Aura, effects: [{ type: E.Damage, value: 16 }, { type: E.Burn, value: 4, duration: 2 }, { type: E.Knockback, value: 1.5 }], modifiers: [{ type: M.Radius, value: 4 }], color: 0xff7438, accent: 0x8effd0, cooldown: 0.8 }),
  skill({ id: 'flame', name: 'Flame / 炎', tier: 2, carrier: C.Cone, form: F.Persistent, behaviour: B.Cone, effects: [{ type: E.Damage, value: 13 }, { type: E.Burn, value: 5, duration: 2 }], modifiers: [{ type: M.Radius, value: 7 }], color: 0xd8f5ff, accent: 0x4ba8ff, cooldown: 0.3, range: 7 }),
  skill({ id: 'sun', name: 'Sun / 日', tier: 2, carrier: C.Beam, form: F.Pierce, behaviour: B.Beam, effects: [{ type: E.Damage, value: 38 }], modifiers: [{ type: M.Pierce, value: 8 }], color: 0xfff3a0, accent: 0xffffff, cooldown: 0.9, range: 13, eliteBossDamageMultiplier: 1.5 }),
  skill({ id: 'star', name: 'Star / 星', tier: 2, carrier: C.Summon, form: F.Orbit, behaviour: B.Orbit, effects: [{ type: E.Damage, value: 14 }], modifiers: [{ type: M.Radius, value: 3.2 }, { type: M.Speed, value: 1.3 }], color: 0xffef82, accent: 0xff8f3c, cooldown: 0.35, count: 2, scale: 0.42 }),
  skill({ id: 'wisp-flame', name: 'WispFlame / 焰', tier: 2, carrier: C.Player, form: F.Orbit, behaviour: B.Orbit, effects: [{ type: E.Damage, value: 9 }, { type: E.Burn, value: 4, duration: 2 }], modifiers: [{ type: M.Radius, value: 2.7 }, { type: M.Speed, value: 2 }], color: 0x8952ff, accent: 0xff7048, cooldown: 0.25, count: 4 }),
  skill({ id: 'ember', name: 'Ember / 烬', tier: 2, carrier: C.EnemyStatus, form: F.Burst, behaviour: B.BurstProjectile, effects: [{ type: E.Damage, value: 18 }, { type: E.Burn, value: 5, duration: 2.2 }], modifiers: [{ type: M.Radius, value: 2.4 }], color: 0xb14c35, accent: 0xff9b54, cooldown: 0.72, deathBurstRadius: 2.8 }),
  skill({ id: 'ghost-fire', name: 'GhostFire / 鬼', tier: 2, carrier: C.Summon, form: F.Homing, behaviour: B.Homing, effects: [{ type: E.Damage, value: 18 }, { type: E.Burn, value: 3, duration: 1.8 }], modifiers: [{ type: M.Pierce, value: 2 }, { type: M.Speed, value: 12 }], color: 0x7d5cff, accent: 0x55ffd4, cooldown: 0.55, count: 3 }),
  skill({ id: 'mud', name: 'Mud / 泥', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.Slow, value: 0.3, duration: 1.2 }, { type: E.Damage, value: 5 }], modifiers: [{ type: M.Radius, value: 3 }, { type: M.Duration, value: 5 }], color: 0x765a3a, accent: 0x4e85a6, cooldown: 0.95 }),
  skill({ id: 'spring', name: 'Spring / 泉', tier: 2, carrier: C.Zone, form: F.Pulse, behaviour: B.Aura, effects: [{ type: E.Damage, value: 12 }, { type: E.Knockback, value: 1.2 }, { type: E.Heal, value: 1 }], modifiers: [{ type: M.Radius, value: 3.5 }], color: 0x5cd8ff, accent: 0xe7fbff, cooldown: 0.85 }),
  skill({ id: 'swamp', name: 'Swamp / 沼', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.DamageOverTime, value: 7, duration: 1.4, interval: 0.4 }, { type: E.Slow, value: 0.28, duration: 1.2 }], modifiers: [{ type: M.Radius, value: 4.2 }, { type: M.Duration, value: 6 }], color: 0x526b38, accent: 0x8c7042, cooldown: 1 }),
  skill({ id: 'fog', name: 'Fog / 雾', tier: 2, carrier: C.PlayerAura, form: F.Persistent, behaviour: B.Aura, effects: [{ type: E.Slow, value: 0.55, duration: 1 }, { type: E.AttackRateDown, value: 0.6, duration: 1 }], modifiers: [{ type: M.Radius, value: 4.4 }], color: 0xbcd6dc, accent: 0xffffff, cooldown: 0.45 }),
  skill({ id: 'rain', name: 'Rain / 雨', tier: 2, carrier: C.Zone, form: F.Rain, behaviour: B.Rain, effects: [{ type: E.Damage, value: 18 }], modifiers: [{ type: M.Radius, value: 5.5 }], color: 0x5ab9ff, accent: 0xc7efff, cooldown: 0.25, count: 2 }),
  skill({ id: 'wave', name: 'Wave / 浪', tier: 2, carrier: C.Wave, form: F.Expand, behaviour: B.Wave, effects: [{ type: E.Damage, value: 24 }, { type: E.Knockback, value: 2.2 }], modifiers: [{ type: M.Radius, value: 4.5 }], color: 0x3cafff, accent: 0xe6fbff, cooldown: 0.9, range: 10 }),
  skill({ id: 'ice', name: 'Ice / 冰', tier: 2, carrier: C.Projectile, form: F.Straight, behaviour: B.Projectile, effects: [{ type: E.Damage, value: 20 }, { type: E.Freeze, value: 0.55, duration: 1.1 }], color: 0xa6efff, accent: 0xffffff, cooldown: 0.72 }),
  skill({ id: 'rainbow', name: 'Rainbow / 虹', tier: 2, carrier: C.Projectile, form: F.Split, behaviour: B.Split, effects: [{ type: E.Damage, value: 15 }], modifiers: [{ type: M.Split, value: 5 }], color: 0xff77cf, accent: 0x74eaff, cooldown: 0.7 }),
  skill({ id: 'snow', name: 'Snow / 雪', tier: 2, carrier: C.PlayerAura, form: F.Pulse, behaviour: B.Aura, effects: [{ type: E.Slow, value: 0.45, duration: 1.4 }, { type: E.Freeze, value: 1, duration: 0.4 }], modifiers: [{ type: M.Radius, value: 5 }], color: 0xe5fbff, accent: 0x92dfff, cooldown: 1.1 }),
  skill({ id: 'poison', name: 'Poison / 毒', tier: 2, carrier: C.EnemyStatus, form: F.Straight, behaviour: B.Projectile, effects: [{ type: E.Damage, value: 10 }, { type: E.Poison, value: 4, duration: 4, interval: 0.5 }], color: 0x72d65c, accent: 0xb8ff77, cooldown: 0.58 }),
  skill({ id: 'ink', name: 'Ink / 墨', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.Slow, value: 0.52, duration: 1.3 }, { type: E.AttackRateDown, value: 0.5, duration: 1.3 }], modifiers: [{ type: M.Radius, value: 3.2 }, { type: M.Duration, value: 5 }], color: 0x211b39, accent: 0x795cbd, cooldown: 0.9 }),
  skill({ id: 'acid', name: 'Acid / 酸', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.DamageOverTime, value: 9, duration: 1.6, interval: 0.35 }, { type: E.ArmorBreak, value: 1.3, duration: 2.5 }], modifiers: [{ type: M.Radius, value: 2.5 }, { type: M.Duration, value: 4.5 }], color: 0xa6ed3d, accent: 0x4b6dff, cooldown: 0.82 }),
  skill({ id: 'sand', name: 'Sand / 沙', tier: 2, carrier: C.Cone, form: F.Persistent, behaviour: B.Cone, effects: [{ type: E.Damage, value: 8 }, { type: E.ArmorBreak, value: 1.18, duration: 2 }], modifiers: [{ type: M.Radius, value: 5 }], color: 0xd5b56f, accent: 0xffe2a4, cooldown: 0.3, range: 5 }),
  skill({ id: 'dust', name: 'Dust / 尘', tier: 2, carrier: C.Player, form: F.Trail, behaviour: B.Trail, effects: [{ type: E.Damage, value: 7 }, { type: E.Slow, value: 0.62, duration: 1.2 }], modifiers: [{ type: M.Radius, value: 1.8 }, { type: M.Duration, value: 3 }], color: 0xb99b6a, accent: 0x8bc7bb, cooldown: 0.3 }),
  skill({ id: 'sandstorm', name: 'Sandstorm / 暴', tier: 2, carrier: C.PlayerAura, form: F.Persistent, behaviour: B.Aura, effects: [{ type: E.Damage, value: 10 }, { type: E.Knockback, value: 0.45 }], modifiers: [{ type: M.Radius, value: 4.2 }], color: 0xc9aa68, accent: 0x8ce0c2, cooldown: 0.38 }),
  skill({ id: 'crystal', name: 'Crystal / 晶', tier: 2, carrier: C.Projectile, form: F.Split, behaviour: B.Split, effects: [{ type: E.Damage, value: 20 }], modifiers: [{ type: M.Pierce, value: 1 }, { type: M.Split, value: 4 }], color: 0xb8f0ff, accent: 0xfff2ad, cooldown: 0.72 }),
  skill({ id: 'mirror', name: 'Mirror / 镜', tier: 2, carrier: C.Projectile, form: F.Ricochet, behaviour: B.Ricochet, effects: [{ type: E.Damage, value: 20 }], modifiers: [{ type: M.Chain, value: 4 }], color: 0xe7faff, accent: 0xffe88d, cooldown: 0.68 }),
  skill({ id: 'steel', name: 'Steel / 钢', tier: 2, carrier: C.Player, form: F.Orbit, behaviour: B.Orbit, effects: [{ type: E.Damage, value: 18 }], modifiers: [{ type: M.Radius, value: 2.8 }, { type: M.Speed, value: 2.4 }], color: 0xc7d1d6, accent: 0xffe381, cooldown: 0.25, count: 5, scale: 0.34, shape: 'blade' }),
  skill({ id: 'coal', name: 'Coal / 煤', tier: 2, carrier: C.Projectile, form: F.Straight, behaviour: B.Projectile, effects: [{ type: E.Damage, value: 52 }, { type: E.Knockback, value: 2.3 }], modifiers: [{ type: M.Speed, value: 10 }], color: 0x29242a, accent: 0xb45b3a, cooldown: 1.15, scale: 0.42 }),
  skill({ id: 'gravity', name: 'Gravity / 引', tier: 2, carrier: C.Projectile, form: F.Burst, behaviour: B.BurstProjectile, effects: [{ type: E.Damage, value: 15 }, { type: E.Pull, value: 1.4 }], modifiers: [{ type: M.Radius, value: 3.2 }], color: 0x6e50a7, accent: 0xc7a5ff, cooldown: 0.8 }),
  skill({ id: 'black-hole', name: 'BlackHole / 黑', tier: 2, carrier: C.Zone, form: F.PullField, behaviour: B.PullField, effects: [{ type: E.DamageOverTime, value: 8, duration: 1, interval: 0.3 }, { type: E.Pull, value: 0.45 }], modifiers: [{ type: M.Radius, value: 3.6 }, { type: M.Duration, value: 5 }, { type: M.ScaleOverTime, value: 1.6 }], color: 0x140c24, accent: 0x8d5cff, cooldown: 1.2 }),
  skill({ id: 'glow', name: 'Glow / 霞', tier: 2, carrier: C.Wave, form: F.Pierce, behaviour: B.Wave, effects: [{ type: E.Damage, value: 22 }], modifiers: [{ type: M.Radius, value: 5.5 }, { type: M.Pierce, value: 99 }], color: 0xffbdcf, accent: 0x9cf7ff, cooldown: 0.75, range: 11 }),
  skill({ id: 'halo', name: 'Halo / 晕', tier: 2, carrier: C.PlayerAura, form: F.Pulse, behaviour: B.Aura, effects: [{ type: E.Damage, value: 20 }], modifiers: [{ type: M.Radius, value: 4 }], color: 0xffed91, accent: 0xffffff, cooldown: 0.72 }),
  skill({ id: 'aurora', name: 'Aurora / 极', tier: 2, carrier: C.Zone, form: F.Persistent, behaviour: B.ZoneProjectile, effects: [{ type: E.DamageOverTime, value: 10, duration: 1, interval: 0.25 }], modifiers: [{ type: M.Radius, value: 4 }, { type: M.Duration, value: 6 }], color: 0x5dffd0, accent: 0xb36eff, cooldown: 1.1, opacity: 0.34, shape: 'curtain' }),
  skill({ id: 'miasma', name: 'Miasma / 瘴', tier: 2, carrier: C.Cone, form: F.Persistent, behaviour: B.Cone, effects: [{ type: E.DamageOverTime, value: 7, duration: 2, interval: 0.5 }, { type: E.AttackRateDown, value: 0.55, duration: 1.4 }], modifiers: [{ type: M.Radius, value: 5 }], color: 0x6d7d45, accent: 0x7d55a3, cooldown: 0.5, range: 5 }),
  skill({ id: 'soul', name: 'Soul / 魂', tier: 2, carrier: C.HomingProjectile, form: F.Homing, behaviour: B.Homing, effects: [{ type: E.Damage, value: 22 }], modifiers: [{ type: M.Pierce, value: 3 }, { type: M.Speed, value: 13 }], color: 0x9e8cff, accent: 0xbaffed, cooldown: 0.58 }),
  skill({ id: 'void', name: 'Void / 虚', tier: 2, carrier: C.Projectile, form: F.BlinkProjectile, behaviour: B.Blink, effects: [{ type: E.Damage, value: 30 }], color: 0x472c75, accent: 0xd08cff, cooldown: 0.78 }),
  skill({ id: 'dusk', name: 'Dusk / 暮', tier: 2, carrier: C.Wave, form: F.Expand, behaviour: B.Wave, effects: [{ type: E.Damage, value: 20 }, { type: E.Slow, value: 0.62, duration: 1.5 }, { type: E.DamageDown, value: 0.7, duration: 1.5 }], modifiers: [{ type: M.Radius, value: 5 }], color: 0x8c5b91, accent: 0xffad7d, cooldown: 0.82, range: 10 }),
  skill({ id: 'dawn', name: 'Dawn / 曙', tier: 2, carrier: C.PlayerAura, form: F.Pulse, behaviour: B.Aura, effects: [{ type: E.Damage, value: 18 }, { type: E.Heal, value: 2 }], modifiers: [{ type: M.Radius, value: 4.2 }], color: 0xffd29a, accent: 0xfff8cf, cooldown: 0.9 }),
  skill({ id: 'shadow', name: 'Shadow / 影', tier: 2, carrier: C.Projectile, form: F.DelayedEcho, behaviour: B.DelayedEcho, effects: [{ type: E.Damage, value: 22 }], modifiers: [{ type: M.DamageMultiplier, value: 0.55 }], color: 0x34304d, accent: 0xb6a7ff, cooldown: 0.7 }),
]

export const EVOLUTION_SKILLS: readonly SkillDefinition[] = [...TIER_1_SKILLS, ...TIER_2_SKILLS]
