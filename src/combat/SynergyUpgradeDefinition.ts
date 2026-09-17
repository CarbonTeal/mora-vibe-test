import { WeaponType } from './WeaponDefinition.ts'

export const SynergyParameter = {
  Damage: 'Damage', Radius: 'Radius', Size: 'Size', ProjectileSpeed: 'ProjectileSpeed',
  Duration: 'Duration', TickRate: 'TickRate', StackCap: 'StackCap', StackGain: 'StackGain',
  PullStrength: 'PullStrength', FreezeDuration: 'FreezeDuration', FreezeBuildup: 'FreezeBuildup',
  OrbitSpeed: 'OrbitSpeed', ProjectileCount: 'ProjectileCount', Spread: 'Spread', Knockback: 'Knockback',
  PerAttackStatusCap: 'PerAttackStatusCap',
} as const
export type SynergyParameter = typeof SynergyParameter[keyof typeof SynergyParameter]

export type SynergyTrigger = 'Always' | 'OnHit' | 'OnMultiHit'

export interface SynergyModifier {
  parameter: SynergyParameter
  operation: 'Add' | 'Multiply'
  value: number
}

export interface SynergyUpgradeDefinition {
  id: string
  name: string
  description: string
  requirements: { weaponType: WeaponType; evolutionId: string }
  trigger: SynergyTrigger
  modifiers: readonly SynergyModifier[]
  duration?: number
  maxStacks?: number
  shopCost: number
}

const synergy = (
  evolutionId: string,
  weaponType: WeaponType,
  name: string,
  trigger: SynergyTrigger,
  modifiers: readonly SynergyModifier[],
  duration?: number,
  maxStacks = 1,
): SynergyUpgradeDefinition => ({
  id: `${weaponType.toLowerCase()}-${evolutionId}-synergy`,
  name,
  description: `${weaponType} + ${evolutionId}: ${name}`,
  requirements: { weaponType, evolutionId },
  trigger,
  modifiers,
  duration,
  maxStacks,
  shopCost: 8,
})

const P = SynergyParameter
const W = WeaponType

export const SYNERGY_UPGRADES: readonly SynergyUpgradeDefinition[] = [
  synergy('star', W.Pistol, '精准星轨', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.2 }, { parameter: P.Radius, operation: 'Multiply', value: 1.1 }]),
  synergy('star', W.SMG, '高速公转', 'Always', [{ parameter: P.OrbitSpeed, operation: 'Multiply', value: 1.25 }]),
  synergy('star', W.Shotgun, '扩张星环', 'Always', [{ parameter: P.Radius, operation: 'Multiply', value: 1.15 }, { parameter: P.Size, operation: 'Multiply', value: 1.2 }]),

  synergy('black-hole', W.Pistol, '聚焦引力', 'Always', [{ parameter: P.PullStrength, operation: 'Multiply', value: 1.3 }]),
  synergy('black-hole', W.SMG, '压缩循环', 'Always', [{ parameter: P.TickRate, operation: 'Multiply', value: 0.85 }]),
  synergy('black-hole', W.Shotgun, '事件视界', 'Always', [{ parameter: P.Radius, operation: 'Multiply', value: 1.25 }]),

  synergy('explosion', W.Pistol, '马格南爆裂', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.2 }, { parameter: P.Radius, operation: 'Multiply', value: 1.1 }]),
  synergy('explosion', W.SMG, '微型爆震', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 0.9 }]),
  synergy('explosion', W.Shotgun, '散射爆裂', 'Always', [{ parameter: P.Radius, operation: 'Multiply', value: 1.2 }]),

  synergy('magma', W.Pistol, '炽热核心', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.2 }]),
  synergy('magma', W.SMG, '急速熔池', 'Always', [{ parameter: P.TickRate, operation: 'Multiply', value: 0.85 }]),
  synergy('magma', W.Shotgun, '熔岩散布', 'Always', [{ parameter: P.Radius, operation: 'Multiply', value: 1.15 }]),

  synergy('poison', W.Pistol, '浓缩毒素', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.2 }]),
  synergy('poison', W.SMG, 'Venom Feed', 'Always', [{ parameter: P.StackGain, operation: 'Add', value: 1 }, { parameter: P.StackCap, operation: 'Add', value: 3 }]),
  synergy('poison', W.Shotgun, 'Toxic Buckshot', 'Always', [{ parameter: P.PerAttackStatusCap, operation: 'Add', value: 1 }]),

  synergy('ice', W.Pistol, 'Deep Freeze', 'Always', [{ parameter: P.FreezeDuration, operation: 'Multiply', value: 1.55 }]),
  synergy('ice', W.SMG, 'Cryo Rhythm', 'Always', [{ parameter: P.FreezeBuildup, operation: 'Multiply', value: 1.45 }]),
  synergy('ice', W.Shotgun, 'Flash Freeze', 'Always', [{ parameter: P.FreezeBuildup, operation: 'Multiply', value: 1.85 }, { parameter: P.PerAttackStatusCap, operation: 'Add', value: 5 }]),

  synergy('rain', W.Pistol, '精准暴雨', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.2 }]),
  synergy('rain', W.SMG, '密集雨幕', 'Always', [{ parameter: P.TickRate, operation: 'Multiply', value: 0.85 }]),
  synergy('rain', W.Shotgun, '扩散雨域', 'Always', [{ parameter: P.Radius, operation: 'Multiply', value: 1.2 }]),

  synergy('steel', W.Pistol, '淬钢刃环', 'Always', [{ parameter: P.Damage, operation: 'Multiply', value: 1.2 }]),
  synergy('steel', W.SMG, '高速钢轮', 'Always', [{ parameter: P.OrbitSpeed, operation: 'Multiply', value: 1.25 }]),
  synergy('steel', W.Shotgun, '重型刃环', 'Always', [{ parameter: P.Radius, operation: 'Multiply', value: 1.15 }, { parameter: P.Size, operation: 'Multiply', value: 1.2 }]),
]
