import * as THREE from 'three'
import { GAME_CONFIG } from '../../config/gameConfig.ts'
import type { Enemy } from '../../entities/Enemy.ts'
import type { Player } from '../../entities/Player.ts'
import { Projectile } from '../../entities/Projectile.ts'
import type { SkillDefinition } from '../SkillDefinition.ts'
import { EffectType, ModifierType, SkillBehaviour, SkillForm, SkillTrigger } from '../SkillEnums.ts'
import { EffectResolver } from './EffectResolver.ts'
import { getModifierValue } from './ModifierResolver.ts'
import { StatusSystem } from './StatusSystem.ts'
import type { WeaponRuntime } from '../../combat/WeaponRuntime.ts'
import { SynergyParameter } from '../../combat/SynergyUpgradeDefinition.ts'
import { EvolutionFamily, WEAPON_EVOLUTION_PROFILES, type WeaponEvolutionProfile } from '../../combat/WeaponEvolutionSynergy.ts'

interface RuntimeZone {
  definition: SkillDefinition
  object: THREE.Mesh
  remaining: number
  initialDuration: number
  pulseCooldown: number
  followPlayer: boolean
  expanding: boolean
}

interface RuntimeOrbit {
  definition: SkillDefinition
  group: THREE.Group
  pulseCooldown: number
}

interface RuntimeVisual {
  object: THREE.Object3D
  initialLifetime: number
  remaining: number
  expand: boolean
}

interface RuntimeEcho {
  definition: SkillDefinition
  remaining: number
  target?: Enemy
  origin: THREE.Vector3
}

export class SkillRuntime {
  private readonly scene: THREE.Scene
  private readonly definitionMap = new Map<string, SkillDefinition>()
  private readonly onEnemyDefeated: () => void
  private readonly weapon: WeaponRuntime
  private readonly statuses = new StatusSystem()
  private readonly effects = new EffectResolver(this.statuses)
  private readonly projectiles: Projectile[] = []
  private readonly zones: RuntimeZone[] = []
  private readonly orbits: RuntimeOrbit[] = []
  private readonly visuals: RuntimeVisual[] = []
  private readonly echoes: RuntimeEcho[] = []
  private readonly timerCooldowns = new Map<string, number>()
  private readonly deathBurstProcessed = new Set<string>()
  private readonly pendingSpecialDefeats = new Map<Enemy, SkillDefinition>()
  private currentEnemies: Enemy[] = []
  private attackSequence = 0
  private readonly statusApplicationsByAttack = new Map<number, number>()

  constructor(
    scene: THREE.Scene,
    definitions: readonly SkillDefinition[],
    weapon: WeaponRuntime,
    onEnemyDefeated: () => void = () => undefined,
  ) {
    this.scene = scene
    this.onEnemyDefeated = onEnemyDefeated
    this.weapon = weapon
    for (const definition of definitions) this.unlockDefinition(definition)
  }

  get definitions(): readonly SkillDefinition[] { return [...this.definitionMap.values()] }
  get activeSkillNames(): string[] { return this.definitions.map((definition) => definition.name) }
  get debugObjectCounts(): string {
    return `P${this.projectiles.length} Z${this.zones.length} O${this.orbits.length} V${this.visuals.length} E${this.echoes.length}`
  }

  unlockDefinition(definition: SkillDefinition): boolean {
    if (this.definitionMap.has(definition.id)) return false
    this.definitionMap.set(definition.id, definition)
    this.timerCooldowns.set(definition.id, 0)
    return true
  }

  setEvolutionDefinition(definition: SkillDefinition): void {
    this.resetDefinitions([definition])
  }

  resetDefinitions(definitions: readonly SkillDefinition[]): void {
    this.clearCombatState()
    this.definitionMap.clear()
    this.timerCooldowns.clear()
    for (const definition of definitions) this.unlockDefinition(definition)
  }

  getPlayerMoveSpeedMultiplier(player: Player): number {
    return this.effects.getPlayerMoveSpeedMultiplier(this.definitions, player)
  }

  getEnemyMoveSpeedMultiplier(enemy: Enemy): number { return this.statuses.getMoveSpeedMultiplier(enemy) }
  getEnemyAttackRateMultiplier(enemy: Enemy): number { return this.statuses.getAttackRateMultiplier(enemy) }
  getEnemyDamageOutputMultiplier(enemy: Enemy): number { return this.statuses.getDamageOutputMultiplier(enemy) }

  update(delta: number, player: Player, enemies: Enemy[]): void {
    this.weapon.synergy.update(delta)
    this.currentEnemies = enemies
    for (const defeat of this.statuses.update(delta)) {
      const source = this.definitionMap.get(defeat.sourceId.split(':')[0]) ?? this.definitions[0]
      if (source) this.handleDefeat(defeat.enemy, source, player)
    }
    this.updateTimerSkills(delta, player, enemies)
    this.updateProjectiles(delta, player, enemies)
    this.updateZones(delta, player, enemies)
    this.updateOrbits(delta, player, enemies)
    this.updateEchoes(delta, enemies)
    this.updateVisuals(delta)
  }

  defeatAll(enemies: Enemy[], player: Player): void {
    const fallback = this.definitions[0]
    if (!fallback) return
    for (const enemy of enemies) {
      if (enemy.health.isDead) continue
      enemy.health.takeDamage(enemy.health.current)
      this.handleDefeat(enemy, fallback, player)
    }
  }

  defeatEnemy(enemy: Enemy, player: Player): void {
    const fallback = this.definitions[0]
    if (!fallback || enemy.health.isDead) return
    enemy.health.takeDamage(enemy.health.current)
    this.handleDefeat(enemy, fallback, player)
  }

  finalizeSpecialDefeat(enemy: Enemy, player: Player, rewarded: boolean): void {
    const definition = this.pendingSpecialDefeats.get(enemy)
    this.pendingSpecialDefeats.delete(enemy)
    if (!definition || !rewarded) return
    this.grantDefeatReward(enemy, definition, player)
  }

  forgetEnemy(enemy: Enemy): void {
    this.statuses.clearEnemy(enemy)
    this.pendingSpecialDefeats.delete(enemy)
  }

  clearCombatState(): void {
    while (this.projectiles.length) this.removeProjectile(this.projectiles.length - 1)
    for (const zone of this.zones) this.disposeObject(zone.object)
    for (const orbit of this.orbits) this.disposeObject(orbit.group)
    for (const visual of this.visuals) this.disposeObject(visual.object)
    this.zones.length = 0
    this.orbits.length = 0
    this.visuals.length = 0
    this.echoes.length = 0
    this.statuses.clear()
    this.deathBurstProcessed.clear()
    this.pendingSpecialDefeats.clear()
    this.currentEnemies = []
    this.statusApplicationsByAttack.clear()
    this.weapon.synergy.clearTransientState()
  }

  dispose(): void { this.clearCombatState() }

  private updateTimerSkills(delta: number, player: Player, enemies: Enemy[]): void {
    for (const definition of this.definitions) {
      if (definition.trigger !== SkillTrigger.OnTimer) continue
      const behaviour = this.behaviourOf(definition)
      if (behaviour === SkillBehaviour.Orbit) {
        this.ensureOrbit(definition)
        continue
      }
      if (behaviour === SkillBehaviour.Aura) {
        this.ensureAura(definition, player)
        continue
      }

      const cooldown = (this.timerCooldowns.get(definition.id) ?? 0) - delta
      if (cooldown > 0) {
        this.timerCooldowns.set(definition.id, cooldown)
        continue
      }
      const target = this.findNearestTarget(player.object.position, enemies, this.effectiveRange(definition))
      if (!target) {
        this.timerCooldowns.set(definition.id, 0)
        continue
      }
      this.activate(definition, player, enemies, target)
      this.effects.applyActivationCosts(definition, player)
      const interval = this.effectiveAttackInterval(definition) * this.effects.getAttackIntervalMultiplier(definition, player)
      this.timerCooldowns.set(definition.id, Math.max(0.05, interval))
    }
  }

  private activate(definition: SkillDefinition, player: Player, enemies: Enemy[], target: Enemy): void {
    const origin = player.object.position.clone()
    const behaviour = this.behaviourOf(definition)
    const attackId = this.nextAttackId()
    switch (behaviour) {
      case SkillBehaviour.Cone: this.createCone(definition, origin, target.object.position, player, enemies, attackId); break
      case SkillBehaviour.Beam: this.createBeam(definition, origin, target.object.position, player, enemies, attackId); break
      case SkillBehaviour.Wave: this.createWave(definition, origin, target.object.position, player, enemies, attackId); break
      case SkillBehaviour.Rain: this.createRain(definition, origin, player, enemies, attackId); break
      case SkillBehaviour.Trail: this.createZone(definition, origin, false); break
      case SkillBehaviour.DelayedEcho:
        this.launchProjectiles(definition, origin, target, false, 1, attackId)
        this.echoes.push({ definition, remaining: 0.28, target, origin })
        break
      default: this.launchProjectiles(definition, origin, target, false, 1, attackId)
    }
  }

  private updateProjectiles(delta: number, player: Player, enemies: Enemy[]): void {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index]
      projectile.update(delta, enemies)
      let consumed = projectile.isExpired
      if (!consumed) {
        for (const enemy of enemies) {
          if (enemy.health.isDead || projectile.hitTargets.has(enemy.object.uuid)) continue
          const hitDistance = projectile.radius + enemy.radius
          if (projectile.object.position.distanceToSquared(enemy.object.position) > hitDistance ** 2) continue
          projectile.hitTargets.add(enemy.object.uuid)
          consumed = this.resolveProjectileHit(projectile, enemy, player, enemies)
          break
        }
      }
      if (consumed) this.removeProjectile(index)
    }
  }

  private resolveProjectileHit(projectile: Projectile, enemy: Enemy, player: Player, enemies: Enemy[]): boolean {
    const definition = projectile.definition
    const behaviour = this.behaviourOf(definition)
    const position = enemy.object.position.clone()
    if (behaviour === SkillBehaviour.BurstProjectile) {
      this.applyAreaEffects(definition, position, this.runtimeModifier(definition, ModifierType.Radius, 2), player, enemies, projectile.damageScale, projectile.attackId, true)
      this.createBurstVisual(definition, position)
    } else if (behaviour === SkillBehaviour.ZoneProjectile || behaviour === SkillBehaviour.PullField) {
      this.weapon.synergy.recordHit(projectile.attackId, enemy.object.uuid)
      this.createZone(definition, position, behaviour === SkillBehaviour.PullField)
    } else {
      this.applyEffects(definition, enemy, player, projectile.object.position, projectile.damageScale, projectile.attackId, true)
    }

    if (behaviour === SkillBehaviour.Split && projectile.generation === 0) {
      this.launchSplitProjectiles(definition, position, enemy, projectile.damageScale * 0.55)
    }
    if (behaviour === SkillBehaviour.Ricochet && projectile.remainingChains > 0) {
      const next = this.findNearestUnhit(position, enemies, projectile.hitTargets, 7)
      if (next) {
        projectile.remainingChains -= 1
        projectile.retarget(next.object.position)
        return false
      }
    }
    if (projectile.remainingPierces > 0) {
      projectile.remainingPierces -= 1
      if (behaviour === SkillBehaviour.Homing) {
        projectile.setTarget(this.findNearestUnhit(position, enemies, projectile.hitTargets, this.effectiveRange(definition)))
      }
      return false
    }
    return true
  }

  private updateZones(delta: number, player: Player, enemies: Enemy[]): void {
    for (let index = this.zones.length - 1; index >= 0; index -= 1) {
      const zone = this.zones[index]
      zone.remaining -= delta
      zone.pulseCooldown -= delta
      if (zone.followPlayer) zone.object.position.copy(player.object.position).setY(0.06)
      if (zone.expanding && Number.isFinite(zone.remaining)) {
        const progress = 1 - zone.remaining / zone.initialDuration
        zone.object.scale.setScalar(1 + Math.max(0, progress) * (this.runtimeModifier(zone.definition, ModifierType.ScaleOverTime, 1) - 1))
      }
      if (zone.pulseCooldown <= 0) {
        const scale = zone.object.scale.x
        this.applyAreaEffects(zone.definition, zone.object.position, this.runtimeModifier(zone.definition, ModifierType.Radius, 2) * scale, player, enemies, 1, this.nextAttackId())
        const baseTick = zone.followPlayer ? this.effectiveAttackInterval(zone.definition) : (zone.definition.cooldown ?? 0.5)
        zone.pulseCooldown += Math.max(0.05, this.runtimeTickRate(zone.definition, baseTick))
      }
      if (zone.remaining <= 0) {
        this.disposeObject(zone.object)
        this.zones.splice(index, 1)
      }
    }
  }

  private updateOrbits(delta: number, player: Player, enemies: Enemy[]): void {
    for (const orbit of this.orbits) {
      orbit.group.position.copy(player.object.position)
      const orbitRadius = this.runtimeModifier(orbit.definition, ModifierType.Radius, 2.7)
      const sizeMultiplier = this.weapon.synergy.getMultiplier(SynergyParameter.Size)
      orbit.group.children.forEach((child, index) => {
        const angle = index / Math.max(1, orbit.group.children.length) * Math.PI * 2
        child.position.x = Math.cos(angle) * orbitRadius
        child.position.z = Math.sin(angle) * orbitRadius
        child.scale.setScalar(sizeMultiplier)
      })
      orbit.group.rotation.y += this.runtimeOrbitSpeed(orbit.definition) * delta
      orbit.group.updateMatrixWorld()
      orbit.pulseCooldown -= delta
      if (orbit.pulseCooldown > 0) continue
      orbit.pulseCooldown += this.effectiveAttackInterval(orbit.definition)
      const attackId = this.nextAttackId()
      for (const enemy of enemies) {
        if (enemy.health.isDead) continue
        const hitRadius = enemy.radius + (orbit.definition.visual.scale ?? 0.25) * sizeMultiplier
        if (orbit.group.children.some((child) => child.getWorldPosition(new THREE.Vector3()).distanceToSquared(enemy.object.position) <= hitRadius ** 2)) {
          this.applyEffects(orbit.definition, enemy, player, player.object.position, 1, attackId)
        }
      }
    }
  }

  private updateEchoes(delta: number, enemies: Enemy[]): void {
    for (let index = this.echoes.length - 1; index >= 0; index -= 1) {
      const echo = this.echoes[index]
      echo.remaining -= delta
      if (echo.remaining > 0) continue
      const target = echo.target && !echo.target.health.isDead
        ? echo.target
        : this.findNearestTarget(echo.origin, enemies, this.effectiveRange(echo.definition))
      if (target) {
        const scale = getModifierValue(echo.definition, ModifierType.DamageMultiplier, 0.5)
        this.launchProjectiles(echo.definition, echo.origin, target, true, scale, this.nextAttackId())
      }
      this.echoes.splice(index, 1)
    }
  }

  private updateVisuals(delta: number): void {
    for (let index = this.visuals.length - 1; index >= 0; index -= 1) {
      const visual = this.visuals[index]
      visual.remaining -= delta
      const progress = 1 - visual.remaining / visual.initialLifetime
      if (visual.expand) visual.object.scale.setScalar(1 + progress * 0.45)
      visual.object.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material && 'opacity' in child.material) {
          const material = child.material as THREE.Material & { opacity: number; transparent: boolean }
          material.transparent = true
          material.opacity = Math.max(0, 1 - progress) * 0.65
        }
      })
      if (visual.remaining <= 0) {
        this.disposeObject(visual.object)
        this.visuals.splice(index, 1)
      }
    }
  }

  private launchProjectiles(
    definition: SkillDefinition,
    origin: THREE.Vector3,
    target: Enemy,
    secondary: boolean,
    damageScale = 1,
    attackId = this.nextAttackId(),
  ): void {
    const weapon = this.weapon.stats
    const profile = this.profileFor(definition)
    const baseCount = definition.count ?? (definition.form === SkillForm.Spread ? 3 : 1)
    const count = Math.min(8, Math.max(1, Math.round(baseCount * weapon.projectileCount * profile.projectileCountMultiplier)))
    const base = target.object.position.clone().sub(origin).setY(0)
    if (base.lengthSq() <= 0.0001) return
    for (let index = 0; index < count; index += 1) {
      const baseSpread = Math.max(weapon.spread, definition.form === SkillForm.Spread ? 0.42 : 0)
      const spread = count === 1
        ? (Math.random() - 0.5) * baseSpread
        : THREE.MathUtils.lerp(-baseSpread / 2, baseSpread / 2, index / (count - 1))
      const direction = base.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), spread)
      const projectile = new Projectile(definition, origin, direction, {
        target,
        generation: secondary ? 1 : 0,
        damageScale,
        projectileSpeed: this.runtimeProjectileSpeed(definition),
        extraPierce: weapon.pierce,
        attackId,
        maxRange: this.effectiveRange(definition),
      })
      this.projectiles.push(projectile)
      this.scene.add(projectile.object)
    }
  }

  private launchSplitProjectiles(definition: SkillDefinition, origin: THREE.Vector3, source: Enemy, damageScale: number): void {
    const count = Math.min(8, Math.max(2, Math.round(getModifierValue(definition, ModifierType.Split, 3))))
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2
      const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle))
      const projectile = new Projectile(definition, origin, direction, {
        generation: 1,
        damageScale,
        projectileSpeed: this.runtimeProjectileSpeed(definition),
        extraPierce: this.weapon.stats.pierce,
        attackId: this.nextAttackId(),
        maxRange: this.effectiveRange(definition),
      })
      projectile.hitTargets.add(source.object.uuid)
      this.projectiles.push(projectile)
      this.scene.add(projectile.object)
    }
  }

  private createZone(definition: SkillDefinition, position: THREE.Vector3, expanding: boolean): void {
    const radius = this.runtimeModifier(definition, ModifierType.Radius, 2)
    const duration = this.runtimeModifier(definition, ModifierType.Duration, 3)
    const geometry = definition.visual.shape === 'curtain'
      ? new THREE.BoxGeometry(radius * 2.4, 1.8, 0.28)
      : new THREE.CylinderGeometry(radius, radius, 0.1, 28)
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: definition.visual.color, emissive: definition.visual.accentColor ?? definition.visual.color, emissiveIntensity: 0.35, transparent: true, opacity: definition.visual.opacity ?? 0.4 }),
    )
    mesh.position.copy(position).setY(definition.visual.shape === 'curtain' ? 0.9 : 0.06)
    this.scene.add(mesh)
    this.zones.push({ definition, object: mesh, remaining: duration, initialDuration: duration, pulseCooldown: 0, followPlayer: false, expanding })
  }

  private ensureAura(definition: SkillDefinition, player: Player): void {
    if (this.zones.some((zone) => zone.definition.id === definition.id && zone.followPlayer)) return
    const radius = this.runtimeModifier(definition, ModifierType.Radius, 3.5)
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.76, radius, 40),
      new THREE.MeshBasicMaterial({ color: definition.visual.color, side: THREE.DoubleSide, transparent: true, opacity: 0.26 }),
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.position.copy(player.object.position).setY(0.06)
    this.scene.add(mesh)
    this.zones.push({ definition, object: mesh, remaining: Number.POSITIVE_INFINITY, initialDuration: 1, pulseCooldown: 0, followPlayer: true, expanding: false })
  }

  private ensureOrbit(definition: SkillDefinition): void {
    if (this.orbits.some((orbit) => orbit.definition.id === definition.id)) return
    const group = new THREE.Group()
    const radius = this.runtimeModifier(definition, ModifierType.Radius, 2.7)
    const count = definition.count ?? 3
    for (let index = 0; index < count; index += 1) {
      const scale = definition.visual.scale ?? 0.28
      const geometry = definition.visual.shape === 'blade'
        ? new THREE.BoxGeometry(scale * 0.45, scale * 2.3, scale * 0.18)
        : new THREE.SphereGeometry(scale, 10, 8)
      const object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: definition.visual.color, emissive: definition.visual.accentColor ?? definition.visual.color, emissiveIntensity: 0.8 }))
      const angle = index / count * Math.PI * 2
      object.position.set(Math.cos(angle) * radius, 0.7, Math.sin(angle) * radius)
      object.rotation.z = angle
      group.add(object)
    }
    group.name = `Orbit:${definition.id}`
    this.scene.add(group)
    this.orbits.push({ definition, group, pulseCooldown: 0 })
  }

  private createCone(definition: SkillDefinition, origin: THREE.Vector3, target: THREE.Vector3, player: Player, enemies: Enemy[], attackId: number): void {
    const range = this.effectiveRange(definition)
    const forward = target.clone().sub(origin).setY(0).normalize()
    for (const enemy of enemies) {
      const offset = enemy.object.position.clone().sub(origin).setY(0)
      const distance = offset.length()
      if (distance <= range + enemy.radius && distance > 0 && forward.dot(offset.normalize()) >= 0.66) this.applyEffects(definition, enemy, player, origin, 1, attackId)
    }
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(range * 0.7, range, 24, 1, true), new THREE.MeshBasicMaterial({ color: definition.visual.color, transparent: true, opacity: 0.32, side: THREE.DoubleSide }))
    mesh.rotation.x = Math.PI / 2
    mesh.rotation.z = Math.atan2(forward.z, forward.x) - Math.PI / 2
    mesh.position.copy(origin).addScaledVector(forward, range * 0.5).setY(0.18)
    this.addVisual(mesh, 0.24, false)
  }

  private createBeam(definition: SkillDefinition, origin: THREE.Vector3, target: THREE.Vector3, player: Player, enemies: Enemy[], attackId: number): void {
    const range = this.effectiveRange(definition)
    const direction = target.clone().sub(origin).setY(0).normalize()
    this.applyCorridorEffects(definition, origin, direction, range, 0.55, player, enemies, attackId)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, range), new THREE.MeshBasicMaterial({ color: definition.visual.color, transparent: true, opacity: 0.82 }))
    mesh.position.copy(origin).addScaledVector(direction, range / 2).setY(0.65)
    mesh.rotation.y = Math.atan2(direction.x, direction.z)
    this.addVisual(mesh, 0.22, false)
  }

  private createWave(definition: SkillDefinition, origin: THREE.Vector3, target: THREE.Vector3, player: Player, enemies: Enemy[], attackId: number): void {
    const range = this.effectiveRange(definition)
    const width = this.runtimeModifier(definition, ModifierType.Radius, 4)
    const direction = target.clone().sub(origin).setY(0).normalize()
    this.applyCorridorEffects(definition, origin, direction, range, width, player, enemies, attackId)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width * 2, 0.14, range), new THREE.MeshBasicMaterial({ color: definition.visual.color, transparent: true, opacity: 0.42 }))
    mesh.position.copy(origin).addScaledVector(direction, range / 2).setY(0.12)
    mesh.rotation.y = Math.atan2(direction.x, direction.z)
    this.addVisual(mesh, 0.42, true)
  }

  private createRain(definition: SkillDefinition, origin: THREE.Vector3, player: Player, enemies: Enemy[], attackId: number): void {
    const radius = this.runtimeModifier(definition, ModifierType.Radius, 5)
    const count = definition.count ?? 1
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.sqrt(Math.random()) * radius
      const position = origin.clone().add(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance))
      this.applyAreaEffects(definition, position, 1.1, player, enemies, 1, attackId)
      const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 2.4, 8), new THREE.MeshBasicMaterial({ color: definition.visual.color, transparent: true, opacity: 0.7 }))
      drop.position.copy(position).setY(1.2)
      this.addVisual(drop, 0.28, false)
    }
  }

  private applyCorridorEffects(definition: SkillDefinition, origin: THREE.Vector3, direction: THREE.Vector3, range: number, halfWidth: number, player: Player, enemies: Enemy[], attackId: number): void {
    for (const enemy of enemies) {
      if (enemy.health.isDead) continue
      const offset = enemy.object.position.clone().sub(origin).setY(0)
      const forwardDistance = offset.dot(direction)
      const lateral = offset.clone().addScaledVector(direction, -forwardDistance).length()
      if (forwardDistance >= 0 && forwardDistance <= range && lateral <= halfWidth + enemy.radius) this.applyEffects(definition, enemy, player, origin, 1, attackId)
    }
  }

  private applyAreaEffects(definition: SkillDefinition, position: THREE.Vector3, radius: number, player: Player, enemies: Enemy[], damageScale = 1, attackId = this.nextAttackId(), weaponImpact = false): void {
    for (const enemy of enemies) {
      if (enemy.health.isDead) continue
      const dx = enemy.object.position.x - position.x
      const dz = enemy.object.position.z - position.z
      if (dx * dx + dz * dz <= (radius + enemy.radius) ** 2) this.applyEffects(definition, enemy, player, position, damageScale, attackId, weaponImpact)
    }
  }

  private applyEffects(definition: SkillDefinition, enemy: Enemy, player: Player, sourcePosition: THREE.Vector3, damageScale = 1, attackId = this.nextAttackId(), weaponImpact = false): void {
    if (enemy.health.isDead) return
    const profile = this.profileFor(definition)
    const statusEffect = definition.effects.some((effect) => effect.type === EffectType.Poison || effect.type === EffectType.Freeze)
    const synergyCap = this.weapon.synergy.getAdditive(SynergyParameter.PerAttackStatusCap)
    const cap = Math.min(profile.perAttackProcCap, synergyCap > 0 ? synergyCap : Number.POSITIVE_INFINITY)
    const applications = this.statusApplicationsByAttack.get(attackId) ?? 0
    const allowStackingStatus = !statusEffect || applications < cap
    if (statusEffect && allowStackingStatus) this.statusApplicationsByAttack.set(attackId, applications + 1)
    this.weapon.synergy.recordHit(attackId, enemy.object.uuid)
    const defeated = this.effects.apply({
      definition,
      target: enemy,
      player,
      sourcePosition,
      damageScale: damageScale * this.weaponDamageScale(definition),
      durationMultiplier: profile.durationMultiplier * this.weapon.synergy.getMultiplier(SynergyParameter.Duration),
      tickRateMultiplier: profile.tickRateMultiplier * this.weapon.synergy.getMultiplier(SynergyParameter.TickRate),
      stackCapBonus: this.weapon.synergy.getAdditive(SynergyParameter.StackCap),
      stackGainBonus: this.weapon.synergy.getAdditive(SynergyParameter.StackGain),
      pullMultiplier: this.weapon.synergy.getMultiplier(SynergyParameter.PullStrength),
      freezeDurationMultiplier: this.weapon.synergy.getMultiplier(SynergyParameter.FreezeDuration),
      freezeBuildupMultiplier: this.weapon.synergy.getMultiplier(SynergyParameter.FreezeBuildup),
      allowStackingStatus,
      extraKnockback: weaponImpact ? this.weapon.stats.knockback * this.weapon.synergy.getMultiplier(SynergyParameter.Knockback) : 0,
    })
    if (this.statusApplicationsByAttack.size > 128) this.statusApplicationsByAttack.clear()
    if (defeated) this.handleDefeat(enemy, definition, player)
  }

  private createBurstVisual(definition: SkillDefinition, position: THREE.Vector3): void {
    const radius = this.runtimeModifier(definition, ModifierType.Radius, 2)
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.1, 28), new THREE.MeshBasicMaterial({ color: definition.visual.color, transparent: true, opacity: 0.58 }))
    mesh.position.copy(position).setY(0.1)
    this.addVisual(mesh, 0.3, true)
  }

  private addVisual(object: THREE.Object3D, lifetime: number, expand: boolean): void {
    this.scene.add(object)
    this.visuals.push({ object, initialLifetime: lifetime, remaining: lifetime, expand })
  }

  private handleDefeat(enemy: Enemy, definition: SkillDefinition, player: Player): void {
    this.statuses.clearEnemy(enemy)
    if (enemy.isSpecialEnemy) {
      this.pendingSpecialDefeats.set(enemy, definition)
      return
    }
    this.grantDefeatReward(enemy, definition, player)
  }

  private grantDefeatReward(enemy: Enemy, definition: SkillDefinition, player: Player): void {
    player.gainExperience(enemy.xpReward)
    this.onEnemyDefeated()
    if (definition.deathBurstRadius && !this.deathBurstProcessed.has(enemy.object.uuid)) {
      this.deathBurstProcessed.add(enemy.object.uuid)
      const position = enemy.object.position.clone()
      this.createBurstVisual(definition, position)
      this.applyAreaEffects(definition, position, definition.deathBurstRadius, player, this.currentEnemies, 0.55, this.nextAttackId())
    }
  }

  private behaviourOf(definition: SkillDefinition): SkillBehaviour {
    if (definition.behaviour) return definition.behaviour
    if (definition.form === SkillForm.Orbit) return SkillBehaviour.Orbit
    if (definition.form === SkillForm.Burst) return SkillBehaviour.BurstProjectile
    if (definition.form === SkillForm.Persistent) return SkillBehaviour.ZoneProjectile
    if (definition.form === SkillForm.Homing) return SkillBehaviour.Homing
    return SkillBehaviour.Projectile
  }

  private profileFor(definition: SkillDefinition): WeaponEvolutionProfile {
    const behaviour = this.behaviourOf(definition)
    const projectileBehaviours: readonly SkillBehaviour[] = [
      SkillBehaviour.Projectile, SkillBehaviour.BurstProjectile, SkillBehaviour.Homing,
      SkillBehaviour.Ricochet, SkillBehaviour.Split, SkillBehaviour.DelayedEcho, SkillBehaviour.Blink,
    ]
    const zoneBehaviours: readonly SkillBehaviour[] = [
      SkillBehaviour.ZoneProjectile, SkillBehaviour.PullField, SkillBehaviour.Trail, SkillBehaviour.Rain,
    ]
    const family = projectileBehaviours.includes(behaviour)
      ? EvolutionFamily.Projectile
      : zoneBehaviours.includes(behaviour)
        ? EvolutionFamily.Zone
        : EvolutionFamily.Independent
    return WEAPON_EVOLUTION_PROFILES[this.weapon.weaponType][family]
  }

  private weaponDamageScale(definition: SkillDefinition): number {
    return this.weapon.stats.damage / GAME_CONFIG.weapons.referenceDamage *
      this.profileFor(definition).damageMultiplier *
      this.weapon.synergy.getMultiplier(SynergyParameter.Damage)
  }

  private effectiveAttackInterval(definition: SkillDefinition): number {
    const evolutionRatio = (definition.cooldown ?? GAME_CONFIG.weapons.referenceAttackInterval) /
      GAME_CONFIG.weapons.referenceAttackInterval
    return Math.max(0.05, this.weapon.stats.attackInterval * evolutionRatio)
  }

  private effectiveRange(definition: SkillDefinition): number {
    const evolutionRatio = (definition.range ?? GAME_CONFIG.weapons.referenceRange) /
      GAME_CONFIG.weapons.referenceRange
    return this.weapon.stats.range * evolutionRatio
  }

  private runtimeProjectileSpeed(definition: SkillDefinition): number {
    const definitionSpeed = getModifierValue(definition, ModifierType.Speed, GAME_CONFIG.weapons.pistol.projectileSpeed)
    return this.weapon.stats.projectileSpeed *
      definitionSpeed / GAME_CONFIG.weapons.pistol.projectileSpeed *
      this.weapon.synergy.getMultiplier(SynergyParameter.ProjectileSpeed)
  }

  private runtimeOrbitSpeed(definition: SkillDefinition): number {
    return getModifierValue(definition, ModifierType.Speed, 1.8) *
      this.weapon.synergy.getMultiplier(SynergyParameter.OrbitSpeed)
  }

  private runtimeTickRate(definition: SkillDefinition, fallback: number): number {
    return getModifierValue(definition, ModifierType.TickRate, fallback) *
      this.profileFor(definition).tickRateMultiplier *
      this.weapon.synergy.getMultiplier(SynergyParameter.TickRate)
  }

  private runtimeModifier(definition: SkillDefinition, type: ModifierType, fallback: number): number {
    const base = getModifierValue(definition, type, fallback)
    if (type === ModifierType.Radius) {
      return base * this.profileFor(definition).radiusMultiplier * this.weapon.synergy.getMultiplier(SynergyParameter.Radius)
    }
    if (type === ModifierType.Duration) {
      return base * this.profileFor(definition).durationMultiplier * this.weapon.synergy.getMultiplier(SynergyParameter.Duration)
    }
    return base
  }

  private nextAttackId(): number {
    this.attackSequence = (this.attackSequence + 1) % Number.MAX_SAFE_INTEGER
    return this.attackSequence
  }

  private findNearestTarget(origin: THREE.Vector3, enemies: readonly Enemy[], range: number): Enemy | undefined {
    let nearest: Enemy | undefined
    let nearestDistance = range ** 2
    for (const enemy of enemies) {
      if (enemy.health.isDead) continue
      const distance = origin.distanceToSquared(enemy.object.position)
      if (distance <= nearestDistance) { nearest = enemy; nearestDistance = distance }
    }
    return nearest
  }

  private findNearestUnhit(origin: THREE.Vector3, enemies: readonly Enemy[], hitTargets: ReadonlySet<string>, range: number): Enemy | undefined {
    return this.findNearestTarget(origin, enemies.filter((enemy) => !hitTargets.has(enemy.object.uuid)), range)
  }

  private removeProjectile(index: number): void {
    const projectile = this.projectiles[index]
    this.scene.remove(projectile.object)
    projectile.dispose()
    this.projectiles.splice(index, 1)
  }

  private disposeObject(object: THREE.Object3D): void {
    this.scene.remove(object)
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.geometry.dispose()
      if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose())
      else child.material.dispose()
    })
  }
}
