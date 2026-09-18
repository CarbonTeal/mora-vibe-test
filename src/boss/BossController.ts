import * as THREE from 'three'
import { EliteModifier, EnemyArchetype } from '../entities/EnemyArchetype.ts'
import type { Enemy } from '../entities/Enemy.ts'
import type { Player } from '../entities/Player.ts'
import type { EnemySystem } from '../systems/EnemySystem.ts'
import { BOSS_BY_ID, type BossDefinition } from './BossDefinition.ts'
import { BossEnemy } from './BossEnemy.ts'
import { GAME_CONFIG } from '../config/gameConfig.ts'

interface BossHazard {
  mesh: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
  remaining: number
  telegraph: number
  radius: number
  damage: number
  triggered: boolean
}

export class BossController {
  private readonly scene: THREE.Scene
  private readonly enemies: EnemySystem
  private readonly player: Player
  private readonly onDefeated: (definition: BossDefinition) => void
  private readonly hazards: BossHazard[] = []
  private readonly summons = new Set<Enemy>()
  private boss?: BossEnemy
  private pending?: BossDefinition
  private spawnTimer = 0
  private killRewardGranted = false

  constructor(
    scene: THREE.Scene,
    enemies: EnemySystem,
    player: Player,
    onDefeated: (definition: BossDefinition) => void,
  ) {
    this.scene = scene
    this.enemies = enemies
    this.player = player
    this.onDefeated = onDefeated
  }

  startRound(bossId: string): void {
    this.clear()
    this.killRewardGranted = false
    const definition = BOSS_BY_ID.get(bossId)
    if (!definition) throw new Error(`Unknown boss definition: ${bossId}`)
    this.pending = definition
    this.spawnTimer = definition.spawnDelay
  }

  update(delta: number): void {
    if (this.pending && !this.boss) {
      this.spawnTimer -= delta
      if (this.spawnTimer <= 0) this.spawnBoss(this.pending)
    }
    this.updateHazards(delta)
    for (const summon of this.summons) if (summon.health.isDead) this.summons.delete(summon)
  }

  handleDefeated(enemy: Enemy): boolean {
    if (enemy !== this.boss) return false
    const definition = this.boss.definition
    this.boss = undefined
    this.pending = undefined
    this.clearTemporaryObjects()
    if (!this.killRewardGranted) {
      this.killRewardGranted = true
      this.onDefeated(definition)
    }
    return true
  }

  clear(): void {
    if (this.boss) this.enemies.despawn(this.boss)
    this.boss = undefined
    this.pending = undefined
    this.spawnTimer = 0
    this.clearTemporaryObjects()
  }

  dispose(): void { this.clear() }

  get isAlive(): boolean { return Boolean(this.boss && !this.boss.health.isDead) }
  get hp(): string { return this.boss ? `${Math.ceil(this.boss.health.current)} / ${Math.ceil(this.boss.health.max)}` : '—' }
  get phase(): string { return this.boss?.phaseLabel ?? (this.pending ? 'Spawning' : 'None') }
  get isEnraged(): boolean { return this.boss?.isEnraged ?? false }
  get activeBoss(): BossEnemy | undefined { return this.boss }
  get bossKillRewardGranted(): boolean { return this.killRewardGranted }
  get activeSummonCount(): number { return this.summons.size }

  private spawnBoss(definition: BossDefinition): void {
    const position = new THREE.Vector3(0, 0, -12)
    this.boss = new BossEnemy(position, this.enemies.hpDifficultyMultiplier, definition, {
      createHazard: (target, radius, telegraph, damage) => this.createHazard(target, radius, telegraph, damage),
      summonElites: (count) => this.summonElites(count),
      getActiveAddCount: () => this.summons.size,
    })
    this.pending = undefined
    this.enemies.addEnemy(this.boss)
  }

  private createHazard(position: THREE.Vector3, radius: number, telegraph: number, damage: number): void {
    if (this.hazards.length >= 4) return
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 36),
      new THREE.MeshBasicMaterial({ color: 0x62d7ff, transparent: true, opacity: 0.28, depthWrite: false, depthTest: false }),
    )
    mesh.name = 'BossHazardTelegraph'
    mesh.rotation.x = -Math.PI / 2
    mesh.position.copy(position).setY(0.035)
    mesh.renderOrder = 900
    this.scene.add(mesh)
    this.hazards.push({ mesh, remaining: telegraph + 0.3, telegraph, radius, damage, triggered: false })
  }

  private updateHazards(delta: number): void {
    for (let index = this.hazards.length - 1; index >= 0; index -= 1) {
      const hazard = this.hazards[index]
      hazard.remaining -= delta
      const elapsed = hazard.telegraph + 0.3 - hazard.remaining
      hazard.mesh.material.opacity = hazard.triggered ? 0.65 : 0.2 + Math.min(0.35, elapsed / Math.max(0.1, hazard.telegraph) * 0.35)
      if (!hazard.triggered && hazard.remaining <= 0.3) {
        hazard.triggered = true
        hazard.mesh.material.color.setHex(0xff5d6c)
        if (hazard.mesh.position.distanceToSquared(this.player.object.position) <= hazard.radius ** 2) {
          this.player.damageReceiver.receive(hazard.damage)
        }
      }
      if (hazard.remaining <= 0) this.removeHazard(index)
    }
  }

  private summonElites(count: number): void {
    const boss = this.boss
    if (!boss) return
    const remaining = Math.max(0, (boss.definition.maxActiveAdds ?? 6) - this.summons.size)
    const populationCapacity = Math.max(0, GAME_CONFIG.spawning.maxAlive - this.enemies.enemies.length)
    const total = Math.min(count, remaining, populationCapacity)
    for (let index = 0; index < total; index += 1) {
      const archetype = index % 2 === 0 ? EnemyArchetype.Charger : EnemyArchetype.Shooter
      const modifiers = archetype === EnemyArchetype.Shooter
        ? [EliteModifier.RapidFire, EliteModifier.MultiShot]
        : [EliteModifier.Fast]
      this.summons.add(this.enemies.spawnArchetype(archetype, this.player.object.position, modifiers))
    }
  }

  private clearTemporaryObjects(): void {
    for (const summon of this.summons) this.enemies.despawn(summon)
    this.summons.clear()
    for (let index = this.hazards.length - 1; index >= 0; index -= 1) this.removeHazard(index)
    this.enemies.enemyProjectiles.clear()
  }

  private removeHazard(index: number): void {
    const hazard = this.hazards[index]
    this.scene.remove(hazard.mesh)
    hazard.mesh.geometry.dispose()
    hazard.mesh.material.dispose()
    this.hazards.splice(index, 1)
  }
}
