import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'

export class MoneyPickup {
  readonly object: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>
  readonly amount: number
  remaining = GAME_CONFIG.economy.pickupLifetime
  private readonly toPlayer = new THREE.Vector3()

  constructor(position: THREE.Vector3, amount: number) {
    this.amount = amount
    this.object = new THREE.Mesh(
      new THREE.CylinderGeometry(GAME_CONFIG.economy.pickupRadius, GAME_CONFIG.economy.pickupRadius, 0.12, 16),
      new THREE.MeshStandardMaterial({
        color: GAME_CONFIG.economy.pickupColor,
        emissive: GAME_CONFIG.economy.pickupColor,
        emissiveIntensity: 0.85,
        metalness: 0.45,
        roughness: 0.3,
      }),
    )
    this.object.name = 'MoneyPickup'
    this.object.position.copy(position).setY(0.28)
    this.object.rotation.x = Math.PI / 2
  }

  update(delta: number, playerPosition: THREE.Vector3, pickupRange: number): boolean {
    this.remaining -= delta
    this.object.rotation.z += delta * 2.8
    const distance = this.object.position.distanceTo(playerPosition)
    if (distance <= pickupRange && distance > 0.001) {
      const travel = Math.min(distance, GAME_CONFIG.economy.pickupMagnetSpeed * delta)
      this.toPlayer.subVectors(playerPosition, this.object.position).normalize()
      this.object.position.addScaledVector(this.toPlayer, travel)
    }
    return this.object.position.distanceToSquared(playerPosition) <= GAME_CONFIG.economy.pickupContactDistance ** 2
  }

  dispose(): void {
    this.object.geometry.dispose()
    this.object.material.dispose()
  }
}
