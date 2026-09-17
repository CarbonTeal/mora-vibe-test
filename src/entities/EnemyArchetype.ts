import type * as THREE from 'three'

type ValueOf<T> = T[keyof T]

export const EnemyArchetype = {
  Chaser: 'Chaser', Runner: 'Runner', Shooter: 'Shooter', Charger: 'Charger',
} as const
export type EnemyArchetype = ValueOf<typeof EnemyArchetype>

export const EliteModifier = {
  Fast: 'Fast', Tanky: 'Tanky', RapidFire: 'RapidFire', MultiShot: 'MultiShot', RadialBurst: 'RadialBurst',
} as const
export type EliteModifier = ValueOf<typeof EliteModifier>

export type EnemyProjectileEmitter = (origin: THREE.Vector3, direction: THREE.Vector3) => void
