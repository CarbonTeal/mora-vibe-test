import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { Enemy } from '../entities/Enemy.ts'
import type { EnemyProjectileEmitter } from '../entities/EnemyArchetype.ts'
import { BossBehaviour, type BossDefinition } from './BossDefinition.ts'

export interface BossCallbacks {
  createHazard: (position: THREE.Vector3, radius: number, telegraph: number, damage: number) => void
  summonElites: (count: number) => void
  getActiveAddCount: () => number
}

type ChargeState = 'tracking' | 'windup' | 'charging' | 'recovery'

export class BossEnemy extends Enemy {
  readonly definition: BossDefinition
  private readonly callbacks: BossCallbacks
  private readonly bossMovement = new THREE.Vector3()
  private readonly bossChargeDirection = new THREE.Vector3()
  private readonly windupRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  private bossChargeState: ChargeState = 'tracking'
  private bossChargeTimer: number
  private projectileCooldown = 0.6
  private bossRadialCooldown: number
  private hazardCooldown: number
  private summonCooldown: number
  private enrage = false

  constructor(position: THREE.Vector3, hpMultiplier: number, definition: BossDefinition, callbacks: BossCallbacks) {
    super(position, hpMultiplier * definition.hpMultiplier, {
      radiusMultiplier: definition.sizeMultiplier,
      boss: true,
      speedMultiplier: definition.moveSpeedMultiplier,
      showHitHealthRing: true,
      permanentHealthRing: true,
      healthRingRadiusMultiplier: 1.25,
      moneyReward: 0,
      xpReward: 0,
    })
    this.definition = definition
    this.callbacks = callbacks
    this.bossChargeTimer = definition.chargeInterval
    this.bossRadialCooldown = definition.radialInterval
    this.hazardCooldown = definition.hazardInterval ?? 99
    this.summonCooldown = definition.summonInterval ?? 99
    this.object.name = `Boss:${definition.id}`
    this.object.scale.setScalar(definition.sizeMultiplier)
    this.object.position.y = 0.525 * definition.sizeMultiplier
    this.object.material.color.setHex(definition.color)
    this.object.material.emissive.setHex(definition.color)
    this.object.material.emissiveIntensity = 0.55
    this.windupRing = new THREE.Mesh(
      new THREE.RingGeometry(0.72, 0.94, 40),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false }),
    )
    this.windupRing.rotation.x = -Math.PI / 2
    this.windupRing.position.y = -0.47
    this.windupRing.visible = false
    this.windupRing.renderOrder = 1002
    this.object.add(this.windupRing)
  }

  override update(delta: number, playerPosition: THREE.Vector3, speedMultiplier = 1, _attackRateMultiplier = 1, emitProjectile: EnemyProjectileEmitter = () => undefined): void {
    super.update(delta, playerPosition, 0, 1, emitProjectile)
    if (!this.enrage && this.definition.enrageThreshold && this.health.current / this.health.max <= this.definition.enrageThreshold) {
      this.enrage = true
      this.object.material.emissiveIntensity = 1.1
    }
    const speed = GAME_CONFIG.enemy.moveSpeed * this.definition.moveSpeedMultiplier * speedMultiplier
    if (this.definition.behaviour === BossBehaviour.MeleeCycle) this.updateMeleeCycle(delta, playerPosition, speed, emitProjectile)
    else if (this.definition.behaviour === BossBehaviour.RangedHazards) this.updateRanged(delta, playerPosition, speed, emitProjectile)
    else this.updateFinal(delta, playerPosition, speed, emitProjectile)
    this.clampPosition()
  }

  get phaseLabel(): string {
    if (this.enrage) return `Enraged / ${this.bossChargeState}`
    return this.bossChargeState === 'tracking' ? 'Phase 1' : this.bossChargeState
  }

  get isEnraged(): boolean { return this.enrage }

  override get contactDamageMultiplier(): number {
    return this.bossChargeState === 'charging' ? 2.8 : 1.35
  }

  override dispose(): void {
    this.windupRing.geometry.dispose()
    this.windupRing.material.dispose()
    super.dispose()
  }

  private updateMeleeCycle(delta: number, player: THREE.Vector3, speed: number, emit: EnemyProjectileEmitter): void {
    this.updateCharge(delta, player, speed, emit, true)
  }

  private updateRanged(delta: number, player: THREE.Vector3, speed: number, emit: EnemyProjectileEmitter): void {
    this.maintainDistance(player, speed * delta, 9)
    this.updateProjectileAttacks(delta, player, emit)
    this.hazardCooldown -= delta * this.enrageSpeed
    if (this.hazardCooldown <= 0) {
      this.hazardCooldown = this.definition.hazardInterval ?? 4.5
      this.callbacks.createHazard(
        player.clone(),
        this.definition.hazardRadius ?? 2.4,
        this.definition.hazardTelegraph ?? 1.25,
        this.definition.hazardDamage ?? 18,
      )
    }
  }

  private updateFinal(delta: number, player: THREE.Vector3, speed: number, emit: EnemyProjectileEmitter): void {
    this.updateCharge(delta, player, speed, emit, false)
    this.updateProjectileAttacks(delta, player, emit)
    if (!this.enrage) return
    this.summonCooldown -= delta
    if (this.summonCooldown <= 0 && this.callbacks.getActiveAddCount() < (this.definition.maxActiveAdds ?? 6)) {
      this.summonCooldown = this.definition.summonInterval ?? 7
      this.callbacks.summonElites(this.definition.summonCount ?? 3)
    }
  }

  private updateCharge(delta: number, player: THREE.Vector3, speed: number, emit: EnemyProjectileEmitter, burstAfterRecovery: boolean): void {
    this.bossChargeTimer -= delta * this.enrageSpeed
    if (this.bossChargeState === 'tracking') {
      this.bossMoveToward(player, speed * delta)
      if (this.bossChargeTimer <= 0) {
        this.bossChargeState = 'windup'
        this.bossChargeTimer = this.definition.chargeWindup
        this.windupRing.visible = true
        this.object.material.emissiveIntensity = 1.25
      }
    } else if (this.bossChargeState === 'windup' && this.bossChargeTimer <= 0) {
      this.bossChargeDirection.subVectors(player, this.object.position).setY(0).normalize()
      this.bossChargeState = 'charging'
      this.bossChargeTimer = this.definition.chargeDuration
      this.windupRing.visible = false
    } else if (this.bossChargeState === 'charging') {
      this.object.position.addScaledVector(this.bossChargeDirection, this.definition.chargeSpeed * delta)
      if (this.bossChargeTimer <= 0) {
        this.bossChargeState = 'recovery'
        this.bossChargeTimer = this.definition.recovery
        this.object.material.emissiveIntensity = this.enrage ? 1.1 : 0.55
      }
    } else if (this.bossChargeState === 'recovery' && this.bossChargeTimer <= 0) {
      if (burstAfterRecovery) this.emitRadial(emit, this.definition.radialCount)
      this.bossChargeState = 'tracking'
      this.bossChargeTimer = this.definition.chargeInterval
    }
  }

  private updateProjectileAttacks(delta: number, player: THREE.Vector3, emit: EnemyProjectileEmitter): void {
    this.projectileCooldown -= delta * this.enrageSpeed
    this.bossRadialCooldown -= delta * this.enrageSpeed
    if (this.projectileCooldown <= 0) {
      this.projectileCooldown = this.definition.projectileInterval
      const count = this.definition.projectileCount + (this.enrage ? this.definition.enrageProjectileBonus ?? 0 : 0)
      this.emitFan(player, emit, count)
    }
    if (this.bossRadialCooldown <= 0) {
      this.bossRadialCooldown = this.definition.radialInterval
      const count = this.definition.radialCount + (this.enrage ? this.definition.enrageProjectileBonus ?? 0 : 0)
      this.emitRadial(emit, count)
    }
  }

  private emitFan(target: THREE.Vector3, emit: EnemyProjectileEmitter, count: number): void {
    const forward = target.clone().sub(this.object.position).setY(0).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    for (let index = 0; index < count; index += 1) {
      const offset = (index - (count - 1) / 2) * 0.18
      emit(this.object.position, forward.clone().applyAxisAngle(up, offset))
    }
  }

  private emitRadial(emit: EnemyProjectileEmitter, count: number): void {
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2
      emit(this.object.position, new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)))
    }
  }

  private maintainDistance(target: THREE.Vector3, travel: number, preferred: number): void {
    this.bossMovement.subVectors(target, this.object.position).setY(0)
    const distance = this.bossMovement.length()
    if (distance > preferred + 1.2) this.object.position.addScaledVector(this.bossMovement.normalize(), Math.min(travel, distance - preferred))
    else if (distance < preferred - 1.2 && distance > 0.001) this.object.position.addScaledVector(this.bossMovement.normalize(), -travel)
  }

  private bossMoveToward(target: THREE.Vector3, travel: number): void {
    this.bossMovement.subVectors(target, this.object.position).setY(0)
    const distance = this.bossMovement.length()
    if (distance > 0.001) this.object.position.addScaledVector(this.bossMovement.normalize(), Math.min(travel, distance))
  }

  private clampPosition(): void {
    const limit = GAME_CONFIG.arena.halfSize - this.radius
    this.object.position.x = THREE.MathUtils.clamp(this.object.position.x, -limit, limit)
    this.object.position.z = THREE.MathUtils.clamp(this.object.position.z, -limit, limit)
  }

  private get enrageSpeed(): number { return this.enrage ? 1 / (this.definition.enrageIntervalMultiplier ?? 1) : 1 }
}
