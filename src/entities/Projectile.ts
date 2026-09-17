import * as THREE from 'three'
import type { SkillDefinition } from '../skills/SkillDefinition.ts'
import { ModifierType } from '../skills/SkillEnums.ts'
import { getModifierValue } from '../skills/runtime/ModifierResolver.ts'
import { SkillBehaviour } from '../skills/SkillEnums.ts'
import type { Enemy } from './Enemy.ts'

export class Projectile {
  readonly object: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  readonly definition: SkillDefinition
  readonly radius: number
  readonly hitTargets = new Set<string>()
  remainingPierces: number
  remainingChains: number
  readonly generation: number
  readonly damageScale: number
  readonly attackId: number
  private readonly velocity: THREE.Vector3
  private readonly speed: number
  private remainingLifetime: number
  private remainingRange: number
  private target?: Enemy
  private blinked = false

  constructor(
    definition: SkillDefinition,
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    options: { target?: Enemy; generation?: number; damageScale?: number; projectileSpeed?: number; extraPierce?: number; attackId?: number; maxRange?: number } = {},
  ) {
    this.definition = definition
    this.radius = definition.visual.scale ?? 0.18
    this.remainingPierces = getModifierValue(definition, ModifierType.Pierce, 0) + (options.extraPierce ?? 0)
    this.remainingChains = getModifierValue(definition, ModifierType.Chain, 0)
    this.generation = options.generation ?? 0
    this.damageScale = options.damageScale ?? 1
    this.attackId = options.attackId ?? 0
    this.target = options.target
    this.remainingLifetime = getModifierValue(definition, ModifierType.Duration, 1.5)
    this.remainingRange = options.maxRange ?? Number.POSITIVE_INFINITY
    const color = definition.visual.color
    this.object = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 10, 8),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.45,
      }),
    )
    this.object.name = 'Projectile'
    this.object.position.copy(origin)
    this.object.position.y = 0.65
    this.speed = options.projectileSpeed ?? getModifierValue(definition, ModifierType.Speed, 18)
    this.velocity = direction.normalize().multiplyScalar(this.speed)
  }

  update(delta: number, enemies: readonly Enemy[]): void {
    if (this.definition.behaviour === SkillBehaviour.Homing) {
      if (!this.target || this.target.health.isDead) this.target = this.findNearestTarget(enemies)
      if (this.target) this.retarget(this.target.object.position)
    }
    if (this.definition.behaviour === SkillBehaviour.Blink && !this.blinked && this.remainingLifetime < 0.8) {
      if (!this.target || this.target.health.isDead) this.target = this.findNearestTarget(enemies)
      if (this.target) {
        const offset = this.velocity.clone().normalize().multiplyScalar(-0.8)
        this.object.position.copy(this.target.object.position).add(offset)
        this.object.position.y = 0.65
      }
      this.blinked = true
    }
    this.object.position.addScaledVector(this.velocity, delta)
    this.remainingLifetime -= delta
    this.remainingRange -= this.speed * delta
  }

  retarget(position: THREE.Vector3): void {
    const direction = position.clone().sub(this.object.position)
    direction.y = 0
    if (direction.lengthSq() <= 0.0001) return
    this.velocity.copy(direction.normalize().multiplyScalar(this.speed))
  }

  setTarget(target?: Enemy): void {
    this.target = target
    if (target) this.retarget(target.object.position)
  }

  get isExpired(): boolean {
    return this.remainingLifetime <= 0 || this.remainingRange <= 0
  }

  dispose(): void {
    this.object.geometry.dispose()
    this.object.material.dispose()
  }

  private findNearestTarget(enemies: readonly Enemy[]): Enemy | undefined {
    let nearest: Enemy | undefined
    let distance = Number.POSITIVE_INFINITY
    for (const enemy of enemies) {
      if (enemy.health.isDead || this.hitTargets.has(enemy.object.uuid)) continue
      const candidate = this.object.position.distanceToSquared(enemy.object.position)
      if (candidate < distance) { nearest = enemy; distance = candidate }
    }
    return nearest
  }
}
