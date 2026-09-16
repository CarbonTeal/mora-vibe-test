import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { Health } from './Health.ts'
import { PlayerStats } from './PlayerStats.ts'

export class Player {
  readonly object: THREE.Group
  readonly health = new Health(GAME_CONFIG.player.maxHp)
  readonly stats = new PlayerStats()
  readonly radius = GAME_CONFIG.player.radius
  level = 1
  xp = 0

  constructor() {
    this.object = new THREE.Group()
    this.object.name = 'Player'

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius * 0.85, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: GAME_CONFIG.player.color, roughness: 0.55 }),
    )
    body.position.y = 0.6
    body.castShadow = true

    const facingMarker = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    )
    facingMarker.rotation.x = Math.PI / 2
    facingMarker.position.set(0, 0.75, -0.72)

    this.object.add(body, facingMarker)
  }

  move(direction: THREE.Vector2, delta: number, speedMultiplier = 1): void {
    const speed = GAME_CONFIG.player.moveSpeed * speedMultiplier
    this.object.position.x += direction.x * speed * delta
    this.object.position.z += direction.y * speed * delta

    const limit = GAME_CONFIG.arena.halfSize - this.radius
    this.object.position.x = THREE.MathUtils.clamp(this.object.position.x, -limit, limit)
    this.object.position.z = THREE.MathUtils.clamp(this.object.position.z, -limit, limit)

    if (direction.lengthSq() > 0) {
      this.object.rotation.y = Math.atan2(-direction.x, -direction.y)
    }
  }

  gainExperience(amount: number): void {
    this.xp += amount

    while (this.xp >= this.xpForNextLevel) {
      this.xp -= this.xpForNextLevel
      this.level += 1
    }
  }

  get xpForNextLevel(): number {
    return Math.round(
      GAME_CONFIG.progression.firstLevelXp *
        GAME_CONFIG.progression.xpGrowth ** (this.level - 1),
    )
  }

  dispose(): void {
    for (const child of this.object.children) {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) child.material.dispose()
      }
    }
  }
}
