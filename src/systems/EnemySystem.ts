import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { Enemy } from '../entities/Enemy.ts'
import type { Player } from '../entities/Player.ts'
import type { RoundDifficulty } from '../rounds/RoundSystem.ts'

export class EnemySystem {
  readonly enemies: Enemy[] = []
  private readonly scene: THREE.Scene
  private spawnCooldown: number = GAME_CONFIG.spawning.interval
  private spawningEnabled = true
  private difficulty: RoundDifficulty = {
    enemyHpMultiplier: 1,
    enemySpeedMultiplier: 1,
    spawnRateMultiplier: 1,
  }

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  spawnInitialWave(playerPosition: THREE.Vector3): void {
    this.spawnMany(GAME_CONFIG.spawning.initialCount, playerPosition)
  }

  spawnMany(count: number, playerPosition: THREE.Vector3): void {
    for (let index = 0; index < count; index += 1) this.spawn(playerPosition)
  }

  setSpawningEnabled(enabled: boolean): void {
    this.spawningEnabled = enabled
    if (enabled) this.spawnCooldown = 0
  }

  setDifficulty(difficulty: RoundDifficulty): void {
    this.difficulty = difficulty
  }

  update(
    delta: number,
    player: Player,
    getMoveSpeedMultiplier: (enemy: Enemy) => number = () => 1,
  ): void {
    this.spawnCooldown -= delta
    if (
      this.spawningEnabled &&
      this.spawnCooldown <= 0 &&
      this.enemies.length < GAME_CONFIG.spawning.maxAlive
    ) {
      this.spawn(player.object.position)
      this.spawnCooldown = GAME_CONFIG.spawning.interval / this.difficulty.spawnRateMultiplier
    }

    for (const enemy of this.enemies) {
      if (enemy.health.isDead) continue
      enemy.update(
        delta,
        player.object.position,
        getMoveSpeedMultiplier(enemy) * this.difficulty.enemySpeedMultiplier,
      )
      const collisionDistance = enemy.radius + player.radius
      const distanceSquared = enemy.object.position.distanceToSquared(player.object.position)

      if (distanceSquared <= collisionDistance ** 2 && enemy.canDealContactDamage) {
        player.health.takeDamage(GAME_CONFIG.enemy.contactDamage)
        enemy.resetContactCooldown()
      }
    }
  }

  removeDefeated(): void {
    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      const enemy = this.enemies[index]
      if (!enemy.health.isDead) continue
      this.scene.remove(enemy.object)
      enemy.dispose()
      this.enemies.splice(index, 1)
    }
  }

  clearAll(): void {
    for (const enemy of this.enemies) {
      this.scene.remove(enemy.object)
      enemy.dispose()
    }
    this.enemies.length = 0
  }

  dispose(): void {
    this.clearAll()
  }

  private spawn(playerPosition: THREE.Vector3): void {
    const angle = Math.random() * Math.PI * 2
    const distance = THREE.MathUtils.lerp(
      GAME_CONFIG.spawning.minDistance,
      GAME_CONFIG.spawning.maxDistance,
      Math.random(),
    )
    const position = new THREE.Vector3(
      playerPosition.x + Math.cos(angle) * distance,
      0,
      playerPosition.z + Math.sin(angle) * distance,
    )
    const limit = GAME_CONFIG.arena.halfSize - GAME_CONFIG.enemy.radius
    position.x = THREE.MathUtils.clamp(position.x, -limit, limit)
    position.z = THREE.MathUtils.clamp(position.z, -limit, limit)

    const enemy = new Enemy(position, this.difficulty.enemyHpMultiplier)
    this.enemies.push(enemy)
    this.scene.add(enemy.object)
  }
}
