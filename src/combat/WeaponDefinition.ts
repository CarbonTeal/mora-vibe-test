export const WeaponType = {
  BasicAttack: 'BasicAttack',
  Pistol: 'Pistol',
  SMG: 'SMG',
  Shotgun: 'Shotgun',
} as const
export type WeaponType = typeof WeaponType[keyof typeof WeaponType]

export const STARTER_WEAPON_TYPES = [WeaponType.Pistol, WeaponType.SMG, WeaponType.Shotgun] as const

export interface WeaponDefinition {
  id: WeaponType
  name: string
  displayName: string
  damage: number
  attackInterval: number
  range: number
  projectileSpeed: number
  projectileCount: number
  spread: number
  pierce: number
  knockback: number
}

export type WeaponStatKey = Exclude<keyof WeaponDefinition, 'id' | 'name' | 'displayName'>
