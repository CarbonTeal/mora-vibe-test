import * as THREE from 'three'
import type { SkillDefinition } from '../skills/SkillDefinition.ts'
import { ModifierType } from '../skills/SkillEnums.ts'
import { getModifierValue } from '../skills/runtime/ModifierResolver.ts'

export class Projectile {
  readonly object: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  readonly definition: SkillDefinition
  readonly radius: number
  readonly hitTargets = new Set<string>()
  remainingPierces: number
  private readonly velocity: THREE.Vector3
  private remainingLifetime: number

  constructor(definition: SkillDefinition, origin: THREE.Vector3, direction: THREE.Vector3) {
    this.definition = definition
    this.radius = definition.visual.scale ?? 0.18
    this.remainingPierces = getModifierValue(definition, ModifierType.Pierce, 0)
    this.remainingLifetime = getModifierValue(definition, ModifierType.Duration, 1.5)
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
    const speed = getModifierValue(definition, ModifierType.Speed, 18)
    this.velocity = direction.normalize().multiplyScalar(speed)
  }

  update(delta: number): void {
    this.object.position.addScaledVector(this.velocity, delta)
    this.remainingLifetime -= delta
  }

  get isExpired(): boolean {
    return this.remainingLifetime <= 0
  }

  dispose(): void {
    this.object.geometry.dispose()
    this.object.material.dispose()
  }
}
