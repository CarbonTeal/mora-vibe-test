import { ElementType } from '../elements/ElementType.ts'
import { FusionMode, type FusionRecipe } from './FusionTypes.ts'

export const FUSION_RECIPES: readonly FusionRecipe[] = [
  { id: 'fire-earth', inputA: ElementType.Fire, inputB: ElementType.Earth, mode: FusionMode.Sequential, resultSkillId: 'explosion', displayName: 'Explosion', displayGlyph: '爆' },
  { id: 'earth-fire', inputA: ElementType.Earth, inputB: ElementType.Fire, mode: FusionMode.Sequential, resultSkillId: 'magma', displayName: 'Magma', displayGlyph: '熔' },
  { id: 'fire-earth-simultaneous', inputA: ElementType.Fire, inputB: ElementType.Earth, mode: FusionMode.Simultaneous, resultSkillId: 'steel', displayName: 'Steel', displayGlyph: '钢' },
  { id: 'water-dark', inputA: ElementType.Water, inputB: ElementType.Dark, mode: FusionMode.Sequential, resultSkillId: 'poison', displayName: 'Poison', displayGlyph: '毒' },
  { id: 'dark-water', inputA: ElementType.Dark, inputB: ElementType.Water, mode: FusionMode.Sequential, resultSkillId: 'ink', displayName: 'Ink', displayGlyph: '墨' },
  { id: 'water-dark-simultaneous', inputA: ElementType.Water, inputB: ElementType.Dark, mode: FusionMode.Simultaneous, resultSkillId: 'acid', displayName: 'Acid', displayGlyph: '酸' },
  { id: 'water-light', inputA: ElementType.Water, inputB: ElementType.Light, mode: FusionMode.Sequential, resultSkillId: 'ice', displayName: 'Ice', displayGlyph: '冰' },
  { id: 'light-water', inputA: ElementType.Light, inputB: ElementType.Water, mode: FusionMode.Sequential, resultSkillId: 'rainbow', displayName: 'Rainbow', displayGlyph: '虹' },
  { id: 'water-light-simultaneous', inputA: ElementType.Water, inputB: ElementType.Light, mode: FusionMode.Simultaneous, resultSkillId: 'snow', displayName: 'Snow', displayGlyph: '雪' },
]
