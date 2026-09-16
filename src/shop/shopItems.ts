import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { ShopItemDefinition } from './ShopItem.ts'

const amount = GAME_CONFIG.shop.buffAmount
const cost = GAME_CONFIG.shop.buffCost

export const SHOP_ITEM_DEFINITIONS: readonly ShopItemDefinition[] = [
  {
    id: 'damage-up',
    name: '+10% Damage',
    description: '所有技能伤害提高 10%。',
    cost,
    apply: (stats) => stats.addDamagePercent(amount),
  },
  {
    id: 'attack-speed-up',
    name: '+10% Attack Speed',
    description: '基础攻击间隔缩短约 10%。',
    cost,
    apply: (stats) => stats.addAttackSpeedPercent(amount),
  },
  {
    id: 'move-speed-up',
    name: '+10% Move Speed',
    description: '玩家移动速度提高 10%。',
    cost,
    apply: (stats) => stats.addMoveSpeedPercent(amount),
  },
]
