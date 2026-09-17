import { GAME_CONFIG } from '../config/gameConfig.ts'
import { WeaponType } from '../combat/WeaponDefinition.ts'
import { BuffRarity as R, type BuffDefinition, type BuffRarity, type BuffStatModifier, type BuffTag } from './BuffDefinition.ts'

const price = (rarity: BuffRarity): number => GAME_CONFIG.shop.prices[rarity]
const buff = (
  id: string, displayName: string, description: string, rarity: BuffRarity,
  statModifiers: readonly BuffStatModifier[], tags: readonly BuffTag[],
  options: Partial<Pick<BuffDefinition, 'requirements' | 'weight' | 'maxStacks'>> = {},
): BuffDefinition => ({
  id, displayName, description, rarity, price: price(rarity), statModifiers, tags,
  requirements: options.requirements ?? [], weight: options.weight ?? 1, maxStacks: options.maxStacks ?? 3,
})

const player = (stat: BuffStatModifier['stat'], value: number, operation: 'Add' | 'Multiply' = 'Multiply'): BuffStatModifier => ({ target: 'Player', stat, operation, value })
const weapon = (stat: BuffStatModifier['stat'], value: number, operation: 'Add' | 'Multiply' = 'Multiply', weaponType?: WeaponType): BuffStatModifier => ({ target: 'Weapon', stat, operation, value, weaponType })

export const SHOP_ITEM_DEFINITIONS: readonly BuffDefinition[] = [
  buff('calibrated-rounds', '校准弹药', '+8% 伤害', R.Common, [player('Damage', 1.08)], ['Damage']),
  buff('trigger-tune', '扣机调校', '+8% 攻击速度', R.Common, [player('AttackSpeed', 1.08)], ['AttackSpeed']),
  buff('quick-step', '轻快步伐', '+6% 移动速度', R.Common, [player('MoveSpeed', 1.06)], ['Mobility']),
  buff('armor-plate', '护甲片', '+1 护甲', R.Common, [player('Armor', 1, 'Add')], ['Defense']),
  buff('vitality', '生命储备', '+10 最大生命', R.Common, [player('MaxHP', 10, 'Add')], ['Defense', 'Sustain']),
  buff('magnet-core', '磁力核心', '+1.5 拾取范围', R.Common, [player('PickupRange', 1.5, 'Add')], ['Pickup']),
  buff('rangefinder', '测距仪', '+10% 射程', R.Common, [weapon('range', 1.1)], ['Range', 'Projectile']),
  buff('fast-loader', '高速装药', '+12% 弹丸速度', R.Common, [weapon('projectileSpeed', 1.12)], ['Projectile']),
  buff('stable-grip', '稳定握把', '-10% 散布', R.Common, [weapon('spread', 0.9)], ['Projectile']),
  buff('impact-rounds', '冲击弹', '+15% 击退', R.Common, [weapon('knockback', 1.15)], ['Knockback']),

  buff('light-footwork', '轻盈步伐', '+15% 移动速度\n-6% 伤害', R.Uncommon, [player('MoveSpeed', 1.15), player('Damage', 0.94)], ['Mobility']),
  buff('fanatic-trigger', '狂热扣机', '+18% 攻击速度\n-1 每秒回复', R.Uncommon, [player('AttackSpeed', 1.18), player('HPRegen', -1, 'Add')], ['AttackSpeed', 'Damage']),
  buff('heavy-armor', '厚重护甲', '+3 护甲\n-8% 移动速度', R.Uncommon, [player('Armor', 3, 'Add'), player('MoveSpeed', 0.92)], ['Defense']),
  buff('adrenaline', '肾上腺素', '+10% 闪避\n-8 最大生命', R.Uncommon, [player('Dodge', 0.1, 'Add'), player('MaxHP', -8, 'Add')], ['Defense', 'Mobility']),
  buff('regenerative-tissue', '再生组织', '+1.5 每秒回复\n-8% 攻击速度', R.Uncommon, [player('HPRegen', 1.5, 'Add'), player('AttackSpeed', 0.92)], ['Sustain', 'Defense']),
  buff('glass-cannon', '玻璃大炮', '+22% 伤害\n-12 最大生命', R.Rare, [player('Damage', 1.22), player('MaxHP', -12, 'Add')], ['Damage']),
  buff('long-barrel', '长枪管', '+18% 射程\n-6% 攻击速度', R.Uncommon, [weapon('range', 1.18), player('AttackSpeed', 0.94)], ['Range', 'Projectile']),
  buff('high-velocity', '高速弹', '+25% 弹丸速度\n-5% 伤害', R.Uncommon, [weapon('projectileSpeed', 1.25), player('Damage', 0.95)], ['Projectile', 'Range']),
  buff('defensive-stance', '防御姿态', '+2 护甲 / +5% 闪避\n-8% 伤害', R.Rare, [player('Armor', 2, 'Add'), player('Dodge', 0.05, 'Add'), player('Damage', 0.92)], ['Defense', 'Sustain']),
  buff('berserker-frame', '狂战骨架', '+15% 伤害\n-2 护甲', R.Uncommon, [player('Damage', 1.15), player('Armor', -2, 'Add')], ['Damage']),
  buff('scavenger-rig', '拾荒装具', '+3 拾取范围\n-5% 移动速度', R.Uncommon, [player('PickupRange', 3, 'Add'), player('MoveSpeed', 0.95)], ['Pickup', 'Sustain']),
  buff('overclocked-boots', '超频战靴', '+12% 移动速度\n-6 最大生命', R.Uncommon, [player('MoveSpeed', 1.12), player('MaxHP', -6, 'Add')], ['Mobility']),

  buff('pistol-piercing-rounds', '穿透弹', '+1 穿透', R.Rare, [weapon('pierce', 1, 'Add', WeaponType.Pistol)], ['Pierce', 'Projectile'], { requirements: [{ type: 'Weapon', values: [WeaponType.Pistol] }], maxStacks: 2, weight: 1.2 }),
  buff('shotgun-extra-pellet', '额外弹丸', '+1 弹丸\n-6% 单丸伤害', R.Rare, [weapon('projectileCount', 1, 'Add', WeaponType.Shotgun), weapon('damage', 0.94, 'Multiply', WeaponType.Shotgun)], ['PelletCount', 'Damage'], { requirements: [{ type: 'Weapon', values: [WeaponType.Shotgun] }], maxStacks: 3, weight: 1.25 }),
  buff('shotgun-long-barrel', '散弹长管', '+25% 射程 / -15% 散布\n-6% 攻击速度', R.Rare, [weapon('range', 1.25, 'Multiply', WeaponType.Shotgun), weapon('spread', 0.85, 'Multiply', WeaponType.Shotgun), player('AttackSpeed', 0.94)], ['Range', 'Projectile'], { requirements: [{ type: 'Weapon', values: [WeaponType.Shotgun] }], maxStacks: 2, weight: 1.2 }),
]
