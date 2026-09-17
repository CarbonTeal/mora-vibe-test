import { ElementType as E, type ElementType } from '../elements/ElementType.ts'
import { FusionMode, type FusionRecipe } from './FusionTypes.ts'

interface FusionRow {
  a: ElementType
  b: ElementType
  forward: readonly [id: string, name: string, glyph: string]
  reverse: readonly [id: string, name: string, glyph: string]
  special: readonly [id: string, name: string, glyph: string]
}

const rows: readonly FusionRow[] = [
  { a: E.Fire, b: E.Water, forward: ['steam', 'Steam', '蒸'], reverse: ['boil', 'Boil', '沸'], special: ['cloud', 'Cloud', '云'] },
  { a: E.Fire, b: E.Earth, forward: ['explosion', 'Explosion', '爆'], reverse: ['magma', 'Magma', '熔'], special: ['ash', 'Ash', '灰'] },
  { a: E.Fire, b: E.Wind, forward: ['wildfire', 'Wildfire', '燎'], reverse: ['smoke', 'Smoke', '烟'], special: ['burning-wind', 'BurningWind', '焚'] },
  { a: E.Fire, b: E.Light, forward: ['flame', 'Flame', '炎'], reverse: ['sun', 'Sun', '日'], special: ['star', 'Star', '星'] },
  { a: E.Fire, b: E.Dark, forward: ['wisp-flame', 'WispFlame', '焰'], reverse: ['ember', 'Ember', '烬'], special: ['ghost-fire', 'GhostFire', '鬼'] },
  { a: E.Water, b: E.Earth, forward: ['mud', 'Mud', '泥'], reverse: ['spring', 'Spring', '泉'], special: ['swamp', 'Swamp', '沼'] },
  { a: E.Water, b: E.Wind, forward: ['fog', 'Fog', '雾'], reverse: ['rain', 'Rain', '雨'], special: ['wave', 'Wave', '浪'] },
  { a: E.Water, b: E.Light, forward: ['ice', 'Ice', '冰'], reverse: ['rainbow', 'Rainbow', '虹'], special: ['snow', 'Snow', '雪'] },
  { a: E.Water, b: E.Dark, forward: ['poison', 'Poison', '毒'], reverse: ['ink', 'Ink', '墨'], special: ['acid', 'Acid', '酸'] },
  { a: E.Earth, b: E.Wind, forward: ['sand', 'Sand', '沙'], reverse: ['dust', 'Dust', '尘'], special: ['sandstorm', 'Sandstorm', '暴'] },
  { a: E.Earth, b: E.Light, forward: ['crystal', 'Crystal', '晶'], reverse: ['mirror', 'Mirror', '镜'], special: ['steel', 'Steel', '钢'] },
  { a: E.Earth, b: E.Dark, forward: ['coal', 'Coal', '煤'], reverse: ['gravity', 'Gravity', '引'], special: ['black-hole', 'BlackHole', '黑'] },
  { a: E.Wind, b: E.Light, forward: ['glow', 'Glow', '霞'], reverse: ['halo', 'Halo', '晕'], special: ['aurora', 'Aurora', '极'] },
  { a: E.Wind, b: E.Dark, forward: ['miasma', 'Miasma', '瘴'], reverse: ['soul', 'Soul', '魂'], special: ['void', 'Void', '虚'] },
  { a: E.Light, b: E.Dark, forward: ['dusk', 'Dusk', '暮'], reverse: ['dawn', 'Dawn', '曙'], special: ['shadow', 'Shadow', '影'] },
]

export const FUSION_RECIPES: readonly FusionRecipe[] = rows.flatMap((row) => [
  { id: `${row.a.toLowerCase()}-${row.b.toLowerCase()}`, inputA: row.a, inputB: row.b, mode: FusionMode.Sequential, resultSkillId: row.forward[0], displayName: row.forward[1], displayGlyph: row.forward[2] },
  { id: `${row.b.toLowerCase()}-${row.a.toLowerCase()}`, inputA: row.b, inputB: row.a, mode: FusionMode.Sequential, resultSkillId: row.reverse[0], displayName: row.reverse[1], displayGlyph: row.reverse[2] },
  { id: `${row.a.toLowerCase()}-${row.b.toLowerCase()}-simultaneous`, inputA: row.a, inputB: row.b, mode: FusionMode.Simultaneous, resultSkillId: row.special[0], displayName: row.special[1], displayGlyph: row.special[2] },
])
