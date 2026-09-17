import * as THREE from 'three'
import type { Player } from '../entities/Player.ts'
import { EnemyProjectile } from '../entities/EnemyProjectile.ts'
import { GAME_CONFIG } from '../config/gameConfig.ts'

export class EnemyProjectileSystem {
  readonly projectiles: EnemyProjectile[] = []
  private readonly scene: THREE.Scene

  constructor(scene: THREE.Scene) { this.scene = scene }

  spawn(origin: THREE.Vector3, direction: THREE.Vector3): void {
    if (direction.lengthSq() < 0.0001) return
    const projectile = new EnemyProjectile(origin, direction)
    this.projectiles.push(projectile)
    this.scene.add(projectile.object)
  }

  update(delta: number, player: Player): void {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index]
      projectile.update(delta)
      const hitDistance = projectile.radius + player.radius
      if (projectile.object.position.distanceToSquared(player.object.position) <= hitDistance ** 2) {
        player.damageReceiver.receive(GAME_CONFIG.enemy.projectile.damage)
        this.remove(index)
      } else if (projectile.expired) {
        this.remove(index)
      }
    }
  }

  clear(): void {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) this.remove(index)
  }

  dispose(): void { this.clear() }

  private remove(index: number): void {
    const projectile = this.projectiles[index]
    this.scene.remove(projectile.object)
    projectile.dispose()
    this.projectiles.splice(index, 1)
  }
}
