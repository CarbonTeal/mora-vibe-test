import { GAME_CONFIG } from '../config/gameConfig.ts'
import { WeaponType, type WeaponDefinition } from './WeaponDefinition.ts'

export const WEAPON_DEFINITIONS: Record<WeaponType, WeaponDefinition> = {
  [WeaponType.BasicAttack]: { id: WeaponType.BasicAttack, name: 'Basic Attack', displayName: '基础攻击', ...GAME_CONFIG.weapons.basicAttack },
  [WeaponType.Pistol]: { id: WeaponType.Pistol, name: 'Pistol', displayName: '手枪', ...GAME_CONFIG.weapons.pistol },
  [WeaponType.SMG]: { id: WeaponType.SMG, name: 'SMG', displayName: '冲锋枪', ...GAME_CONFIG.weapons.smg },
  [WeaponType.Shotgun]: { id: WeaponType.Shotgun, name: 'Shotgun', displayName: '散弹枪', ...GAME_CONFIG.weapons.shotgun },
}
