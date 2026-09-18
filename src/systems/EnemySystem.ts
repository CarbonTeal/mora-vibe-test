import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { Enemy } from '../entities/Enemy.ts'
import { ElementEnemy } from '../entities/ElementEnemy.ts'
import type { ElementType } from '../elements/ElementType.ts'
import type { Player } from '../entities/Player.ts'
import type { RoundDifficulty } from '../rounds/RoundSystem.ts'
import { EliteModifier, EnemyArchetype } from '../entities/EnemyArchetype.ts'
import { EnemyProjectileSystem } from './EnemyProjectileSystem.ts'
import { RoundSpecialType, type RoundSpecialDefinition } from '../rounds/RoundSpecialConfig.ts'

export class EnemySystem {
  readonly enemies: Enemy[] = []
  private readonly scene: THREE.Scene
  readonly enemyProjectiles: EnemyProjectileSystem
  private currentRound = 1
  private readonly onEnemySpawned: (enemy: Enemy) => void
  private spawnCooldown: number = GAME_CONFIG.spawning.interval
  private spawningEnabled = true
  private roundSpecial: RoundSpecialDefinition = { type: RoundSpecialType.Normal }
  private difficulty: RoundDifficulty = {
    enemyHpMultiplier: 1,
    enemySpeedMultiplier: 1,
    spawnRateMultiplier: 1,
  }

  constructor(scene: THREE.Scene, onEnemySpawned: (enemy: Enemy) => void = () => undefined) {
    this.scene = scene
    this.onEnemySpawned = onEnemySpawned
    this.enemyProjectiles = new EnemyProjectileSystem(scene)
  }

  spawnMany(count: number, playerPosition: THREE.Vector3): void {
    for (let index = 0; index < count; index += 1) this.spawn(playerPosition)
  }

  spawnArchetype(
    archetype: EnemyArchetype,
    playerPosition: THREE.Vector3,
    eliteModifiers: readonly EliteModifier[] = [],
  ): Enemy {
    const enemy = new Enemy(this.createSpawnPosition(playerPosition), this.difficulty.enemyHpMultiplier, {
      archetype,
      eliteModifiers,
    })
    this.enemies.push(enemy)
    this.scene.add(enemy.object)
    this.onEnemySpawned(enemy)
    return enemy
  }

  addEnemy(enemy: Enemy): void {
    this.enemies.push(enemy)
    this.scene.add(enemy.object)
    this.onEnemySpawned(enemy)
  }

  spawnElementEnemy(element: ElementType, playerPosition: THREE.Vector3, tier3TargetId?: string): ElementEnemy {
    const position = this.createSpawnPosition(playerPosition, GAME_CONFIG.elements.spawnDistance)
    const roundHpMultiplier = GAME_CONFIG.elements.enemyHpMultiplierByRound[this.currentRound] ?? 1
    const enemy = new ElementEnemy(position, element, this.difficulty.enemyHpMultiplier * roundHpMultiplier, tier3TargetId)
    this.enemies.push(enemy)
    this.scene.add(enemy.object)
    this.onEnemySpawned(enemy)
    return enemy
  }

  setSpawningEnabled(enabled: boolean): void {
    const justEnabled = enabled && !this.spawningEnabled
    this.spawningEnabled = enabled
    if (justEnabled) this.spawnCooldown = GAME_CONFIG.spawning.roundStartSpawnGraceSeconds
  }

  setDifficulty(difficulty: RoundDifficulty): void {
    this.difficulty = difficulty
  }

  setRound(round: number): void {
    this.currentRound = round
  }

  setRoundSpecial(definition: RoundSpecialDefinition): void {
    this.roundSpecial = definition
  }

  get hpDifficultyMultiplier(): number { return this.difficulty.enemyHpMultiplier }

  update(
    delta: number,
    player: Player,
    getMoveSpeedMultiplier: (enemy: Enemy) => number = () => 1,
    getAttackRateMultiplier: (enemy: Enemy) => number = () => 1,
    getDamageOutputMultiplier: (enemy: Enemy) => number = () => 1,
  ): void {
    this.spawnCooldown -= delta
    if (
      this.spawningEnabled &&
      this.spawnCooldown <= 0 &&
      this.enemies.length < GAME_CONFIG.spawning.maxAlive
    ) {
      this.spawn(player.object.position)
      const rushMultiplier = this.roundSpecial.eliteRush?.spawnIntervalMultiplier ?? 1
      const bossPressure = this.roundSpecial.bossWave?.spawnPressureMultiplier ?? 1
      this.spawnCooldown = GAME_CONFIG.spawning.interval * rushMultiplier /
        (this.difficulty.spawnRateMultiplier * bossPressure)
    }

    for (const enemy of this.enemies) {
      if (enemy.health.isDead) continue
      enemy.update(
        delta,
        player.object.position,
        getMoveSpeedMultiplier(enemy) * this.difficulty.enemySpeedMultiplier,
        getAttackRateMultiplier(enemy),
        (origin, direction) => this.enemyProjectiles.spawn(origin, direction),
      )
      const collisionDistance = enemy.radius + player.radius
      const distanceSquared = enemy.object.position.distanceToSquared(player.object.position)

      if (distanceSquared <= collisionDistance ** 2 && enemy.canDealContactDamage) {
        player.damageReceiver.receive(GAME_CONFIG.enemy.contactDamage * enemy.contactDamageMultiplier * getDamageOutputMultiplier(enemy))
        enemy.resetContactCooldown(getAttackRateMultiplier(enemy))
      }
    }
    this.enemyProjectiles.update(delta, player)
  }

  removeDefeated(): Enemy[] {
    const defeated: Enemy[] = []
    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      const enemy = this.enemies[index]
      if (!enemy.health.isDead) continue
      defeated.push(enemy)
      this.scene.remove(enemy.object)
      enemy.dispose()
      this.enemies.splice(index, 1)
    }
    return defeated
  }

  clearNormalEnemies(): void {
    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      const enemy = this.enemies[index]
      if (enemy.isPersistent) continue
      this.scene.remove(enemy.object)
      enemy.dispose()
      this.enemies.splice(index, 1)
    }
    this.enemyProjectiles.clear()
  }

  despawn(enemy: Enemy): boolean {
    const index = this.enemies.indexOf(enemy)
    if (index < 0) return false
    this.scene.remove(enemy.object)
    enemy.dispose()
    this.enemies.splice(index, 1)
    return true
  }

  clearAll(): void {
    for (const enemy of this.enemies) {
      this.scene.remove(enemy.object)
      enemy.dispose()
    }
    this.enemies.length = 0
    this.enemyProjectiles.clear()
  }

  dispose(): void {
    this.clearAll()
    this.enemyProjectiles.dispose()
  }

  private spawn(playerPosition: THREE.Vector3): void {
    const archetype = this.chooseArchetype()
    const eliteModifiers = this.chooseEliteModifiers(archetype)
    this.spawnArchetype(archetype, playerPosition, eliteModifiers)
  }

  get countsByArchetype(): Record<EnemyArchetype, number> {
    const counts = {
      [EnemyArchetype.Chaser]: 0,
      [EnemyArchetype.Runner]: 0,
      [EnemyArchetype.Shooter]: 0,
      [EnemyArchetype.Charger]: 0,
    }
    for (const enemy of this.enemies) counts[enemy.archetype] += 1
    return counts
  }

  private chooseArchetype(): EnemyArchetype {
    const specialWeights = this.roundSpecial.type === RoundSpecialType.EliteRush
      ? this.roundSpecial.eliteRush?.archetypeWeights
      : this.roundSpecial.bossWave?.archetypeWeights
    if (specialWeights) {
      const candidates = Object.entries(specialWeights) as Array<[EnemyArchetype, number]>
      const total = candidates.reduce((sum, [, weight]) => sum + weight, 0)
      let roll = Math.random() * total
      for (const [archetype, weight] of candidates) {
        roll -= weight
        if (roll <= 0) return archetype
      }
    }
    const progression = GAME_CONFIG.enemy.progression
    const candidates: Array<{ archetype: EnemyArchetype; weight: number }> = [
      { archetype: EnemyArchetype.Chaser, weight: 1 },
    ]
    if (this.currentRound >= progression.runnerUnlockRound) candidates.push({ archetype: EnemyArchetype.Runner, weight: progression.runnerWeight })
    if (this.currentRound >= progression.shooterUnlockRound) candidates.push({ archetype: EnemyArchetype.Shooter, weight: progression.shooterWeight })
    if (this.currentRound >= progression.chargerUnlockRound) candidates.push({ archetype: EnemyArchetype.Charger, weight: progression.chargerWeight })
    const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0)
    let roll = Math.random() * total
    for (const candidate of candidates) {
      roll -= candidate.weight
      if (roll <= 0) return candidate.archetype
    }
    return EnemyArchetype.Chaser
  }

  private chooseEliteModifiers(archetype: EnemyArchetype): EliteModifier[] {
    const rush = this.roundSpecial.type === RoundSpecialType.EliteRush ? this.roundSpecial.eliteRush : undefined
    if (rush) {
      if (Math.random() >= rush.eliteChance) return []
      const valid = rush.modifiers.filter((modifier) =>
        (modifier !== EliteModifier.RapidFire && modifier !== EliteModifier.MultiShot) || archetype === EnemyArchetype.Shooter,
      )
      const count = Math.min(valid.length, Math.random() < 0.35 ? rush.maxModifiers : 1)
      const shuffled = [...valid].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    }
    const progression = GAME_CONFIG.enemy.progression
    if (this.currentRound < progression.eliteUnlockRound || Math.random() >= progression.eliteChance) return []
    const options: EliteModifier[] = [EliteModifier.Fast, EliteModifier.Tanky, EliteModifier.RadialBurst]
    if (archetype === EnemyArchetype.Shooter) options.push(EliteModifier.RapidFire, EliteModifier.MultiShot)
    return [options[Math.floor(Math.random() * options.length)]]
  }

  private createSpawnPosition(playerPosition: THREE.Vector3, fixedDistance?: number): THREE.Vector3 {
    const angle = Math.random() * Math.PI * 2
    const distance = fixedDistance ?? THREE.MathUtils.lerp(
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
    return position
  }
}
