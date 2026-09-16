import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { Health } from './Health.ts'

export class Enemy {
  readonly object: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
  readonly health: Health
  readonly radius = GAME_CONFIG.enemy.radius
  private contactCooldown = 0

  constructor(position: THREE.Vector3, hpMultiplier = 1) {
    this.health = new Health(Math.round(GAME_CONFIG.enemy.maxHp * hpMultiplier))
    this.object = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.05, 1.05),
      new THREE.MeshStandardMaterial({ color: GAME_CONFIG.enemy.color, roughness: 0.7 }),
    )
    this.object.name = 'Enemy'
    this.object.position.copy(position)
    this.object.position.y = 0.525
    this.object.castShadow = true
  }

  update(delta: number, playerPosition: THREE.Vector3, speedMultiplier = 1): void {
    this.contactCooldown = Math.max(0, this.contactCooldown - delta)
    const toPlayer = new THREE.Vector3().subVectors(playerPosition, this.object.position)
    toPlayer.y = 0
    const distance = toPlayer.length()

    if (distance > 0.001) {
      const travel = Math.min(GAME_CONFIG.enemy.moveSpeed * speedMultiplier * delta, distance)
      this.object.position.addScaledVector(toPlayer.normalize(), travel)
    }
  }

  get canDealContactDamage(): boolean {
    return this.contactCooldown <= 0
  }

  resetContactCooldown(): void {
    this.contactCooldown = GAME_CONFIG.enemy.contactInterval
  }

  dispose(): void {
    this.object.geometry.dispose()
    this.object.material.dispose()
  }
}
