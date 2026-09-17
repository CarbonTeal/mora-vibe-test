import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'

export class EnemyProjectile {
  readonly object: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  readonly radius = GAME_CONFIG.enemy.projectile.radius
  remaining = GAME_CONFIG.enemy.projectile.lifetime
  private readonly velocity: THREE.Vector3

  constructor(origin: THREE.Vector3, direction: THREE.Vector3) {
    this.velocity = direction.clone().setY(0).normalize().multiplyScalar(GAME_CONFIG.enemy.projectile.speed)
    this.object = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 10, 8),
      new THREE.MeshStandardMaterial({
        color: GAME_CONFIG.enemy.projectile.color,
        emissive: GAME_CONFIG.enemy.projectile.color,
        emissiveIntensity: 1.1,
      }),
    )
    this.object.name = 'EnemyProjectile'
    this.object.position.copy(origin).setY(0.55)
  }

  update(delta: number): void {
    this.object.position.addScaledVector(this.velocity, delta)
    this.remaining -= delta
  }

  get expired(): boolean {
    const limit = GAME_CONFIG.arena.halfSize + 4
    return this.remaining <= 0 || Math.abs(this.object.position.x) > limit || Math.abs(this.object.position.z) > limit
  }

  dispose(): void {
    this.object.geometry.dispose()
    this.object.material.dispose()
  }
}
