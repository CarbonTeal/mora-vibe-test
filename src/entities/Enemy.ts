import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { EliteModifier, EnemyArchetype, type EnemyProjectileEmitter } from './EnemyArchetype.ts'
import { Health } from './Health.ts'
import { WorldHealthRing } from '../ui/WorldHealthRing.ts'

export interface EnemyTraits {
  radiusMultiplier?: number
  persistent?: boolean
  special?: boolean
  speedMultiplier?: number
  archetype?: EnemyArchetype
  eliteModifiers?: readonly EliteModifier[]
  showHitHealthRing?: boolean
  healthRingRadiusMultiplier?: number
  permanentHealthRing?: boolean
  boss?: boolean
  moneyReward?: number
  xpReward?: number
}

type ChargeState = 'tracking' | 'windup' | 'charging' | 'cooldown'

const ARCHETYPE_COLORS: Record<EnemyArchetype, number> = {
  [EnemyArchetype.Chaser]: GAME_CONFIG.enemy.color,
  [EnemyArchetype.Runner]: GAME_CONFIG.enemy.archetypes.runner.color,
  [EnemyArchetype.Shooter]: GAME_CONFIG.enemy.archetypes.shooter.color,
  [EnemyArchetype.Charger]: GAME_CONFIG.enemy.archetypes.charger.color,
}

export class Enemy {
  readonly object: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
  readonly health: Health
  readonly radius: number
  readonly isPersistent: boolean
  readonly isSpecialEnemy: boolean
  readonly archetype: EnemyArchetype
  readonly eliteModifiers: readonly EliteModifier[]
  readonly isElite: boolean
  readonly isBoss: boolean
  readonly moneyReward: number
  readonly xpReward: number
  readonly showHitHealthRing: boolean
  private readonly healthRing?: WorldHealthRing
  private readonly baseSpeedMultiplier: number
  private contactCooldown = 0
  private attackCooldown = Math.random() * GAME_CONFIG.enemy.archetypes.shooter.attackInterval
  private radialCooldown = GAME_CONFIG.enemy.elite.radialBurstInterval
  private chargeState: ChargeState = 'tracking'
  private chargeTimer = 0
  private readonly chargeDirection = new THREE.Vector3()
  private readonly movement = new THREE.Vector3()

  constructor(position: THREE.Vector3, hpMultiplier = 1, traits: EnemyTraits = {}) {
    this.archetype = traits.archetype ?? EnemyArchetype.Chaser
    this.eliteModifiers = [...(traits.eliteModifiers ?? [])]
    this.isElite = this.eliteModifiers.length > 0
    this.isBoss = traits.boss ?? false
    const eliteSize = this.isElite ? GAME_CONFIG.enemy.elite.sizeMultiplier : 1
    this.radius = GAME_CONFIG.enemy.radius * (traits.radiusMultiplier ?? 1) * eliteSize
    this.isPersistent = traits.persistent ?? false
    this.isSpecialEnemy = traits.special ?? false
    this.showHitHealthRing = traits.showHitHealthRing ?? (this.isElite || this.isSpecialEnemy)
    this.baseSpeedMultiplier = (traits.speedMultiplier ?? 1) * this.getArchetypeSpeedMultiplier() *
      (this.eliteModifiers.includes(EliteModifier.Fast) ? GAME_CONFIG.enemy.elite.fastSpeedMultiplier : 1)
    const eliteHp = this.eliteModifiers.includes(EliteModifier.Tanky) ? GAME_CONFIG.enemy.elite.tankyHpMultiplier : 1
    this.health = new Health(Math.round(GAME_CONFIG.enemy.maxHp * hpMultiplier * this.getArchetypeHpMultiplier() * eliteHp))
    const reward = this.isSpecialEnemy ? GAME_CONFIG.enemy.rewards.ElementEnemy : GAME_CONFIG.enemy.rewards[this.archetype]
    this.moneyReward = traits.moneyReward ?? (this.isElite
      ? THREE.MathUtils.randInt(GAME_CONFIG.economy.eliteMoneyMin, GAME_CONFIG.economy.eliteMoneyMax)
      : reward.money)
    this.xpReward = traits.xpReward ?? reward.xp
    if (this.archetype === EnemyArchetype.Charger) {
      this.chargeTimer = GAME_CONFIG.enemy.archetypes.charger.trackingDuration * (0.75 + Math.random() * 0.5)
    }
    this.object = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.05, 1.05),
      new THREE.MeshStandardMaterial({
        color: ARCHETYPE_COLORS[this.archetype],
        roughness: 0.65,
        emissive: this.isElite ? 0xffd166 : 0x000000,
        emissiveIntensity: this.isElite ? 0.55 : 0,
      }),
    )
    this.object.name = `${this.isElite ? 'Elite' : ''}${this.archetype}`
    this.object.position.copy(position).setY(0.525 * eliteSize)
    this.object.scale.setScalar(eliteSize)
    this.object.castShadow = true
    if (this.showHitHealthRing) {
      this.healthRing = new WorldHealthRing(this.object, this.health, traits.healthRingRadiusMultiplier ?? 1, traits.permanentHealthRing ?? false)
    }
  }

  update(delta: number, playerPosition: THREE.Vector3, speedMultiplier = 1, attackRateMultiplier = 1, emitProjectile: EnemyProjectileEmitter = () => undefined): void {
    this.contactCooldown = Math.max(0, this.contactCooldown - delta)
    const effectiveSpeed = GAME_CONFIG.enemy.moveSpeed * this.baseSpeedMultiplier * speedMultiplier
    if (this.archetype === EnemyArchetype.Shooter) this.updateShooter(delta, playerPosition, effectiveSpeed, attackRateMultiplier, emitProjectile)
    else if (this.archetype === EnemyArchetype.Charger) this.updateCharger(delta, playerPosition, effectiveSpeed)
    else this.moveToward(playerPosition, effectiveSpeed * delta)
    const limit = GAME_CONFIG.arena.halfSize - this.radius
    this.object.position.x = THREE.MathUtils.clamp(this.object.position.x, -limit, limit)
    this.object.position.z = THREE.MathUtils.clamp(this.object.position.z, -limit, limit)

    if (this.eliteModifiers.includes(EliteModifier.RadialBurst)) {
      this.radialCooldown -= delta * Math.max(0.1, attackRateMultiplier)
      if (this.radialCooldown <= 0) {
        this.radialCooldown = GAME_CONFIG.enemy.elite.radialBurstInterval
        for (let index = 0; index < GAME_CONFIG.enemy.elite.radialBurstCount; index += 1) {
          const angle = index / GAME_CONFIG.enemy.elite.radialBurstCount * Math.PI * 2
          emitProjectile(this.object.position, new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)))
        }
      }
    }
    this.healthRing?.update(delta, this.object)
  }

  get canDealContactDamage(): boolean { return this.contactCooldown <= 0 }
  get contactDamageMultiplier(): number { return 1 }

  resetContactCooldown(attackRateMultiplier = 1): void {
    this.contactCooldown = GAME_CONFIG.enemy.contactInterval / Math.max(0.1, attackRateMultiplier)
  }

  dispose(): void {
    if (this.healthRing) {
      this.object.remove(this.healthRing.object)
      this.healthRing.dispose()
    }
    this.object.geometry.dispose()
    this.object.material.dispose()
  }

  private updateShooter(delta: number, playerPosition: THREE.Vector3, speed: number, attackRateMultiplier: number, emitProjectile: EnemyProjectileEmitter): void {
    this.movement.subVectors(playerPosition, this.object.position).setY(0)
    const distance = this.movement.length()
    const { preferredDistance, distanceBand } = GAME_CONFIG.enemy.archetypes.shooter
    if (distance > preferredDistance + distanceBand) this.moveToward(playerPosition, speed * delta)
    else if (distance < preferredDistance - distanceBand && distance > 0.001) this.object.position.addScaledVector(this.movement.normalize(), -speed * delta)

    this.attackCooldown -= delta * Math.max(0.1, attackRateMultiplier)
    if (this.attackCooldown > 0 || distance <= 0.001) return
    const rapidMultiplier = this.eliteModifiers.includes(EliteModifier.RapidFire) ? GAME_CONFIG.enemy.elite.rapidFireIntervalMultiplier : 1
    this.attackCooldown = GAME_CONFIG.enemy.archetypes.shooter.attackInterval * rapidMultiplier
    const forward = this.movement.normalize()
    const count = this.eliteModifiers.includes(EliteModifier.MultiShot) ? GAME_CONFIG.enemy.elite.multiShotCount : 1
    const up = new THREE.Vector3(0, 1, 0)
    for (let index = 0; index < count; index += 1) {
      const offset = (index - (count - 1) / 2) * GAME_CONFIG.enemy.projectile.multiShotAngle
      emitProjectile(this.object.position, forward.clone().applyAxisAngle(up, offset))
    }
  }

  private updateCharger(delta: number, playerPosition: THREE.Vector3, speed: number): void {
    const config = GAME_CONFIG.enemy.archetypes.charger
    this.chargeTimer -= delta
    if (this.chargeState === 'tracking') {
      this.moveToward(playerPosition, speed * delta)
      if (this.chargeTimer <= 0) {
        this.chargeState = 'windup'
        this.chargeTimer = config.windupDuration
        this.object.material.emissive.setHex(0xffd166)
        this.object.material.emissiveIntensity = 0.85
      }
    } else if (this.chargeState === 'windup' && this.chargeTimer <= 0) {
      this.chargeDirection.subVectors(playerPosition, this.object.position).setY(0).normalize()
      this.chargeState = 'charging'
      this.chargeTimer = config.chargeDuration
    } else if (this.chargeState === 'charging') {
      this.object.position.addScaledVector(this.chargeDirection, config.chargeSpeed * delta)
      if (this.chargeTimer <= 0) {
        this.chargeState = 'cooldown'
        this.chargeTimer = config.cooldown
        this.object.material.emissiveIntensity = this.isElite ? 0.55 : 0
      }
    } else if (this.chargeState === 'cooldown' && this.chargeTimer <= 0) {
      this.chargeState = 'tracking'
      this.chargeTimer = config.trackingDuration
    }
  }

  private moveToward(target: THREE.Vector3, travel: number): void {
    this.movement.subVectors(target, this.object.position).setY(0)
    const distance = this.movement.length()
    if (distance > 0.001) this.object.position.addScaledVector(this.movement.normalize(), Math.min(travel, distance))
  }

  private getArchetypeHpMultiplier(): number {
    if (this.archetype === EnemyArchetype.Runner) return GAME_CONFIG.enemy.archetypes.runner.hpMultiplier
    if (this.archetype === EnemyArchetype.Shooter) return GAME_CONFIG.enemy.archetypes.shooter.hpMultiplier
    if (this.archetype === EnemyArchetype.Charger) return GAME_CONFIG.enemy.archetypes.charger.hpMultiplier
    return 1
  }

  private getArchetypeSpeedMultiplier(): number {
    if (this.archetype === EnemyArchetype.Runner) return GAME_CONFIG.enemy.archetypes.runner.speedMultiplier
    if (this.archetype === EnemyArchetype.Shooter) return GAME_CONFIG.enemy.archetypes.shooter.speedMultiplier
    if (this.archetype === EnemyArchetype.Charger) return GAME_CONFIG.enemy.archetypes.charger.speedMultiplier
    return 1
  }
}
