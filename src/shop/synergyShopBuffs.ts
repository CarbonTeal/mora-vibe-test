import type { SynergyUpgradeDefinition } from '../combat/SynergyUpgradeDefinition.ts'
import { SynergyParameter } from '../combat/SynergyUpgradeDefinition.ts'
import { BuffRarity, type BuffDefinition } from './BuffDefinition.ts'

/** Adapts the existing data-driven combat synergy to the regular shop offer shape. */
export function createSynergyShopBuff(upgrade: SynergyUpgradeDefinition): BuffDefinition {
  return {
    id: `shop-${upgrade.id}`,
    displayName: upgrade.name,
    description: `${upgrade.requirements.weaponType} × ${upgrade.requirements.evolutionId}\n${formatModifiers(upgrade)}`,
    rarity: BuffRarity.Uncommon,
    price: upgrade.shopCost,
    statModifiers: [],
    tags: [],
    requirements: [
      { type: 'Weapon', values: [upgrade.requirements.weaponType] },
      { type: 'EvolutionId', values: [upgrade.requirements.evolutionId] },
    ],
    weight: 1,
    maxStacks: 1,
    source: 'Synergy',
    synergyUpgrade: upgrade,
  }
}

function formatModifiers(upgrade: SynergyUpgradeDefinition): string {
  const labels: Record<SynergyParameter, string> = {
    [SynergyParameter.Damage]: '伤害',
    [SynergyParameter.Radius]: '范围',
    [SynergyParameter.Size]: '尺寸',
    [SynergyParameter.ProjectileSpeed]: '投射物速度',
    [SynergyParameter.Duration]: '持续时间',
    [SynergyParameter.TickRate]: 'Tick 频率',
    [SynergyParameter.StackCap]: '层数上限',
    [SynergyParameter.StackGain]: '每次叠层',
    [SynergyParameter.PullStrength]: '拉力',
    [SynergyParameter.FreezeDuration]: '冻结时长',
    [SynergyParameter.FreezeBuildup]: '冻结积累',
    [SynergyParameter.OrbitSpeed]: '环绕速度',
    [SynergyParameter.ProjectileCount]: '投射物数量',
    [SynergyParameter.Spread]: '散布',
    [SynergyParameter.Knockback]: '击退',
    [SynergyParameter.PerAttackStatusCap]: '单次状态上限',
  }
  return upgrade.modifiers.map((modifier) => {
    const value = modifier.operation === 'Add'
      ? `${modifier.value >= 0 ? '+' : ''}${modifier.value}`
      // Smaller intervals mean a faster Tick rate; all other multipliers are direct.
      : modifier.parameter === SynergyParameter.TickRate
        ? formatPercent((1 - modifier.value) * 100)
        : formatPercent((modifier.value - 1) * 100)
    return `${labels[modifier.parameter]} ${value}`
  }).join(' · ')
}

function formatPercent(value: number): string {
  const rounded = Math.round(value)
  return `${rounded >= 0 ? '+' : ''}${rounded}%`
}
