import type { SynergyUpgradeDefinition } from '../combat/SynergyUpgradeDefinition.ts'
import type { WeaponUpgradeDefinition } from '../combat/WeaponUpgradeDefinition.ts'
import type { ShopItemDefinition } from './ShopItem.ts'

export function weaponUpgradeShopItem(upgrade: WeaponUpgradeDefinition): ShopItemDefinition {
  return {
    id: `shop-${upgrade.id}`,
    name: upgrade.name,
    description: upgrade.description,
    cost: upgrade.shopCost,
    kind: 'WeaponUpgrade',
    requirements: ({ weapon }) => weapon.weaponType === upgrade.weaponType,
    apply: ({ weapon }) => { weapon.applyWeaponUpgrade(upgrade) },
  }
}

export function synergyUpgradeShopItem(upgrade: SynergyUpgradeDefinition): ShopItemDefinition {
  return {
    id: `shop-${upgrade.id}`,
    name: upgrade.name,
    description: upgrade.description,
    cost: upgrade.shopCost,
    kind: 'SynergyUpgrade',
    requirements: ({ weapon, evolutionId }) =>
      weapon.weaponType === upgrade.requirements.weaponType && evolutionId === upgrade.requirements.evolutionId,
    apply: ({ weapon }) => { weapon.applySynergyUpgrade(upgrade) },
  }
}
