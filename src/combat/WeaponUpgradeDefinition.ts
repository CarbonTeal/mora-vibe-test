import { GAME_CONFIG } from '../config/gameConfig.ts'
import { WeaponType, type WeaponStatKey } from './WeaponDefinition.ts'

export interface WeaponStatModifier {
  stat: WeaponStatKey
  operation: 'Add' | 'Multiply'
  value: number
}

export interface WeaponUpgradeDefinition {
  id: string
  name: string
  description: string
  weaponType: WeaponType
  modifiers: readonly WeaponStatModifier[]
  shopCost: number
}

const u = GAME_CONFIG.weapons.upgrades
const upgrade = (id: string, name: string, weaponType: WeaponType, modifiers: readonly WeaponStatModifier[]): WeaponUpgradeDefinition => ({
  id, name, weaponType, modifiers, shopCost: 6, description: `${weaponType}: ${name}`,
})

export const WEAPON_UPGRADES: readonly WeaponUpgradeDefinition[] = [
  upgrade('pistol-damage', 'Damage', WeaponType.Pistol, [{ stat: 'damage', operation: 'Multiply', value: u.damageMultiplier }]),
  upgrade('pistol-range', 'Range', WeaponType.Pistol, [{ stat: 'range', operation: 'Multiply', value: u.rangeMultiplier }]),
  upgrade('pistol-attack-speed', 'AttackSpeed', WeaponType.Pistol, [{ stat: 'attackInterval', operation: 'Multiply', value: u.attackIntervalMultiplier }]),
  upgrade('pistol-projectile-speed', 'ProjectileSpeed', WeaponType.Pistol, [{ stat: 'projectileSpeed', operation: 'Multiply', value: u.projectileSpeedMultiplier }]),
  upgrade('pistol-pierce', 'Pierce', WeaponType.Pistol, [{ stat: 'pierce', operation: 'Add', value: u.pierceAdd }]),
  upgrade('smg-damage', 'Damage', WeaponType.SMG, [{ stat: 'damage', operation: 'Multiply', value: u.damageMultiplier }]),
  upgrade('smg-attack-speed', 'AttackSpeed', WeaponType.SMG, [{ stat: 'attackInterval', operation: 'Multiply', value: u.attackIntervalMultiplier }]),
  upgrade('smg-projectile-speed', 'ProjectileSpeed', WeaponType.SMG, [{ stat: 'projectileSpeed', operation: 'Multiply', value: u.projectileSpeedMultiplier }]),
  upgrade('smg-range', 'Range', WeaponType.SMG, [{ stat: 'range', operation: 'Multiply', value: u.rangeMultiplier }]),
  upgrade('shotgun-damage', 'Damage', WeaponType.Shotgun, [{ stat: 'damage', operation: 'Multiply', value: u.damageMultiplier }]),
  upgrade('shotgun-attack-speed', 'AttackSpeed', WeaponType.Shotgun, [{ stat: 'attackInterval', operation: 'Multiply', value: u.attackIntervalMultiplier }]),
  upgrade('shotgun-projectile-speed', 'ProjectileSpeed', WeaponType.Shotgun, [{ stat: 'projectileSpeed', operation: 'Multiply', value: u.projectileSpeedMultiplier }]),
  upgrade('shotgun-pellet-count', 'PelletCount', WeaponType.Shotgun, [{ stat: 'projectileCount', operation: 'Add', value: u.pelletCountAdd }]),
  upgrade('shotgun-spread-reduction', 'SpreadReduction', WeaponType.Shotgun, [{ stat: 'spread', operation: 'Multiply', value: u.shotgunSpreadMultiplier }]),
  upgrade('shotgun-range', 'Range', WeaponType.Shotgun, [{ stat: 'range', operation: 'Multiply', value: u.rangeMultiplier }]),
]
