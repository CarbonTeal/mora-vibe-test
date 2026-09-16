import * as THREE from 'three'
import { GAME_CONFIG } from '../../config/gameConfig.ts'
import type { Enemy } from '../../entities/Enemy.ts'
import type { Player } from '../../entities/Player.ts'
import { Projectile } from '../../entities/Projectile.ts'
import type { SkillDefinition } from '../SkillDefinition.ts'
import {
  ModifierType,
  SkillCarrier,
  SkillForm,
  SkillTrigger,
  type SkillTrigger as SkillTriggerValue,
} from '../SkillEnums.ts'
import { EffectResolver } from './EffectResolver.ts'
import { getModifierValue } from './ModifierResolver.ts'
import { StatusSystem } from './StatusSystem.ts'

interface SkillEvent {
  position: THREE.Vector3
  sourceDefinition: SkillDefinition
  target?: Enemy
}

interface RuntimeZone {
  definition: SkillDefinition
  mesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>
  remaining: number
  pulseCooldown: number
}

interface RuntimeOrbit {
  definition: SkillDefinition
  group: THREE.Group
  pulseCooldown: number
}

interface RuntimeVisual {
  mesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>
  initialLifetime: number
  remaining: number
}

export class SkillRuntime {
  private readonly scene: THREE.Scene
  private readonly definitionMap = new Map<string, SkillDefinition>()
  private readonly onEnemyDefeated: () => void
  private readonly statuses = new StatusSystem()
  private readonly effects = new EffectResolver(this.statuses)
  private readonly projectiles: Projectile[] = []
  private readonly zones: RuntimeZone[] = []
  private readonly orbits: RuntimeOrbit[] = []
  private readonly visuals: RuntimeVisual[] = []
  private readonly timerCooldowns = new Map<string, number>()

  constructor(
    scene: THREE.Scene,
    definitions: readonly SkillDefinition[],
    onEnemyDefeated: () => void = () => undefined,
  ) {
    this.scene = scene
    this.onEnemyDefeated = onEnemyDefeated
    for (const definition of definitions) this.unlockDefinition(definition)
  }

  get definitions(): readonly SkillDefinition[] {
    return [...this.definitionMap.values()]
  }

  get activeSkillNames(): string[] {
    return this.definitions.map((definition) => definition.name)
  }

  unlockDefinition(definition: SkillDefinition): boolean {
    if (this.definitionMap.has(definition.id)) return false
    this.definitionMap.set(definition.id, definition)
    if (definition.trigger === SkillTrigger.OnTimer) this.timerCooldowns.set(definition.id, 0)
    return true
  }

  resetDefinitions(definitions: readonly SkillDefinition[]): void {
    this.clearCombatState()
    for (const orbit of this.orbits) this.disposeOrbit(orbit)
    this.orbits.length = 0
    this.definitionMap.clear()
    this.timerCooldowns.clear()
    for (const definition of definitions) this.unlockDefinition(definition)
  }

  getPlayerMoveSpeedMultiplier(player: Player): number {
    return this.effects.getPlayerMoveSpeedMultiplier(this.definitions, player)
  }

  getEnemyMoveSpeedMultiplier(enemy: Enemy): number {
    return this.statuses.getMoveSpeedMultiplier(enemy)
  }

  update(delta: number, player: Player, enemies: Enemy[]): void {
    for (const defeat of this.statuses.update(delta)) {
      const sourceDefinition = this.definitions.find(
        (definition) => definition.id === defeat.sourceId,
      ) ?? this.definitions[0]
      this.handleDefeat(defeat.enemy, sourceDefinition, player, enemies)
    }

    this.updateTimerSkills(delta, player, enemies)
    this.updateProjectiles(delta, player, enemies)
    this.updateZones(delta, player, enemies)
    this.updateOrbits(delta, player, enemies)
    this.updateVisuals(delta)
  }

  defeatAll(enemies: Enemy[], player: Player): void {
    const fallbackDefinition = this.definitions[0]
    if (!fallbackDefinition) return
    for (const enemy of enemies) {
      if (enemy.health.isDead) continue
      enemy.health.takeDamage(enemy.health.current)
      this.handleDefeat(enemy, fallbackDefinition, player, enemies)
    }
  }

  clearCombatState(): void {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      this.removeProjectile(index)
    }
    for (const zone of this.zones) this.disposeMesh(zone.mesh)
    for (const visual of this.visuals) this.disposeMesh(visual.mesh)
    this.zones.length = 0
    this.visuals.length = 0
    this.statuses.clear()
  }

  dispose(): void {
    this.clearCombatState()
    for (const orbit of this.orbits) this.disposeOrbit(orbit)
    this.orbits.length = 0
  }

  private updateTimerSkills(delta: number, player: Player, enemies: Enemy[]): void {
    for (const definition of this.definitions) {
      if (definition.trigger !== SkillTrigger.OnTimer) continue

      if (definition.form === SkillForm.Orbit && definition.carrier === SkillCarrier.Player) {
        this.ensureOrbit(definition)
        continue
      }

      const cooldown = (this.timerCooldowns.get(definition.id) ?? 0) - delta
      if (cooldown > 0) {
        this.timerCooldowns.set(definition.id, cooldown)
        continue
      }

      const target = this.findNearestTarget(player.object.position, enemies, definition.range ?? 10)
      if (!target) {
        this.timerCooldowns.set(definition.id, 0)
        continue
      }

      const event: SkillEvent = {
        position: player.object.position.clone(),
        sourceDefinition: definition,
        target,
      }
      this.executeDefinition(definition, event, player, enemies)
      this.effects.applyActivationCosts(definition, player)
      this.dispatch(SkillTrigger.OnAttack, event, player, enemies)

      const interval = (definition.cooldown ?? 1) * this.effects.getAttackIntervalMultiplier(definition, player)
      this.timerCooldowns.set(definition.id, interval)
    }
  }

  private updateProjectiles(delta: number, player: Player, enemies: Enemy[]): void {
    for (let projectileIndex = this.projectiles.length - 1; projectileIndex >= 0; projectileIndex -= 1) {
      const projectile = this.projectiles[projectileIndex]
      projectile.update(delta)
      let consumed = projectile.isExpired

      if (!consumed) {
        for (const enemy of enemies) {
          if (enemy.health.isDead || projectile.hitTargets.has(enemy.object.uuid)) continue
          const hitDistance = projectile.radius + enemy.radius
          if (projectile.object.position.distanceToSquared(enemy.object.position) > hitDistance ** 2) continue

          projectile.hitTargets.add(enemy.object.uuid)
          const hitPosition = enemy.object.position.clone()
          const defeated = this.effects.apply({
            definition: projectile.definition,
            target: enemy,
            player,
            sourcePosition: projectile.object.position,
          })
          if (defeated) this.handleDefeat(enemy, projectile.definition, player, enemies)

          this.dispatch(
            SkillTrigger.OnHit,
            { position: hitPosition, sourceDefinition: projectile.definition, target: enemy },
            player,
            enemies,
          )

          if (projectile.remainingPierces > 0) {
            projectile.remainingPierces -= 1
          } else {
            consumed = true
          }
          break
        }
      }

      if (consumed) this.removeProjectile(projectileIndex)
    }
  }

  private updateZones(delta: number, player: Player, enemies: Enemy[]): void {
    for (let zoneIndex = this.zones.length - 1; zoneIndex >= 0; zoneIndex -= 1) {
      const zone = this.zones[zoneIndex]
      zone.remaining -= delta
      zone.pulseCooldown -= delta

      if (zone.pulseCooldown <= 0) {
        this.applyAreaEffects(
          zone.definition,
          zone.mesh.position,
          getModifierValue(zone.definition, ModifierType.Radius, 2),
          player,
          enemies,
        )
        zone.pulseCooldown += zone.definition.cooldown ?? 0.5
      }

      if (zone.remaining <= 0) {
        this.disposeMesh(zone.mesh)
        this.zones.splice(zoneIndex, 1)
      }
    }
  }

  private updateOrbits(delta: number, player: Player, enemies: Enemy[]): void {
    for (const orbit of this.orbits) {
      const radius = getModifierValue(orbit.definition, ModifierType.Radius, 2.5)
      const speed = getModifierValue(orbit.definition, ModifierType.Speed, 1.5)
      orbit.group.position.copy(player.object.position)
      orbit.group.rotation.y += speed * delta
      orbit.group.updateMatrixWorld()
      orbit.pulseCooldown -= delta

      if (orbit.pulseCooldown > 0) continue
      orbit.pulseCooldown += orbit.definition.cooldown ?? 0.25

      for (const enemy of enemies) {
        if (enemy.health.isDead) continue
        const hitRadius = enemy.radius + (orbit.definition.visual.scale ?? 0.25)
        let hit = false

        for (const child of orbit.group.children) {
          const worldPosition = child.getWorldPosition(new THREE.Vector3())
          if (worldPosition.distanceToSquared(enemy.object.position) <= hitRadius ** 2) {
            hit = true
            break
          }
        }

        if (hit) {
          const defeated = this.effects.apply({
            definition: orbit.definition,
            target: enemy,
            player,
            sourcePosition: player.object.position,
          })
          if (defeated) this.handleDefeat(enemy, orbit.definition, player, enemies)
        }
      }

      if (radius <= 0) orbit.group.visible = false
    }
  }

  private updateVisuals(delta: number): void {
    for (let index = this.visuals.length - 1; index >= 0; index -= 1) {
      const visual = this.visuals[index]
      visual.remaining -= delta
      const progress = 1 - visual.remaining / visual.initialLifetime
      visual.mesh.scale.setScalar(1 + progress * 0.35)
      visual.mesh.material.opacity = Math.max(0, 1 - progress) * 0.55

      if (visual.remaining <= 0) {
        this.disposeMesh(visual.mesh)
        this.visuals.splice(index, 1)
      }
    }
  }

  private dispatch(
    trigger: SkillTriggerValue,
    event: SkillEvent,
    player: Player,
    enemies: Enemy[],
  ): void {
    for (const definition of this.definitions) {
      if (definition.trigger === trigger) {
        this.executeDefinition(definition, event, player, enemies)
      }
    }
  }

  private executeDefinition(
    definition: SkillDefinition,
    event: SkillEvent,
    player: Player,
    enemies: Enemy[],
  ): void {
    switch (definition.form) {
      case SkillForm.Straight:
      case SkillForm.Homing:
      case SkillForm.Spread:
        if (event.target) this.launchProjectiles(definition, event.position, event.target.object.position)
        break
      case SkillForm.Burst:
        this.createBurst(definition, event.position, player, enemies)
        break
      case SkillForm.Persistent:
        if (definition.carrier === SkillCarrier.Zone) this.createZone(definition, event.position)
        break
      case SkillForm.Orbit:
        this.ensureOrbit(definition)
        break
    }
  }

  private launchProjectiles(
    definition: SkillDefinition,
    origin: THREE.Vector3,
    target: THREE.Vector3,
  ): void {
    const baseDirection = new THREE.Vector3().subVectors(target, origin)
    baseDirection.y = 0
    if (baseDirection.lengthSq() === 0) return

    const count = definition.form === SkillForm.Spread ? definition.count ?? 3 : 1
    const spreadRadians = Math.PI / 12
    for (let index = 0; index < count; index += 1) {
      const offset = count === 1 ? 0 : THREE.MathUtils.lerp(-spreadRadians, spreadRadians, index / (count - 1))
      const direction = baseDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), offset)
      const projectile = new Projectile(definition, origin, direction)
      this.projectiles.push(projectile)
      this.scene.add(projectile.object)
    }
  }

  private createBurst(
    definition: SkillDefinition,
    position: THREE.Vector3,
    player: Player,
    enemies: Enemy[],
  ): void {
    const radius = getModifierValue(definition, ModifierType.Radius, 2)
    this.applyAreaEffects(definition, position, radius, player, enemies)

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 0.08, 24),
      new THREE.MeshBasicMaterial({
        color: definition.visual.color,
        transparent: true,
        opacity: definition.visual.opacity ?? 0.5,
      }),
    )
    mesh.position.copy(position)
    mesh.position.y = 0.08
    this.scene.add(mesh)
    this.visuals.push({ mesh, initialLifetime: 0.28, remaining: 0.28 })
  }

  private createZone(definition: SkillDefinition, position: THREE.Vector3): void {
    const radius = getModifierValue(definition, ModifierType.Radius, 2)
    const duration = getModifierValue(definition, ModifierType.Duration, 3)
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 0.08, 28),
      new THREE.MeshStandardMaterial({
        color: definition.visual.color,
        emissive: definition.visual.accentColor ?? definition.visual.color,
        emissiveIntensity: 0.22,
        transparent: true,
        opacity: definition.visual.opacity ?? 0.4,
      }),
    )
    mesh.position.copy(position)
    mesh.position.y = 0.05
    this.scene.add(mesh)
    this.zones.push({ definition, mesh, remaining: duration, pulseCooldown: 0 })
  }

  private ensureOrbit(definition: SkillDefinition): void {
    if (this.orbits.some((orbit) => orbit.definition.id === definition.id)) return
    const group = new THREE.Group()
    const radius = getModifierValue(definition, ModifierType.Radius, 2.5)
    const count = definition.count ?? 3

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2
      const scale = definition.visual.scale ?? 0.25
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(scale, 10, 8),
        new THREE.MeshStandardMaterial({
          color: definition.visual.color,
          emissive: definition.visual.accentColor ?? definition.visual.color,
          emissiveIntensity: 0.7,
        }),
      )
      flame.position.set(Math.cos(angle) * radius, 0.65, Math.sin(angle) * radius)
      group.add(flame)
    }

    group.name = `Orbit:${definition.id}`
    this.scene.add(group)
    this.orbits.push({ definition, group, pulseCooldown: 0 })
  }

  private applyAreaEffects(
    definition: SkillDefinition,
    position: THREE.Vector3,
    radius: number,
    player: Player,
    enemies: Enemy[],
  ): void {
    for (const enemy of enemies) {
      if (enemy.health.isDead) continue
      const dx = enemy.object.position.x - position.x
      const dz = enemy.object.position.z - position.z
      const hitRadius = radius + enemy.radius
      if (dx * dx + dz * dz > hitRadius * hitRadius) continue

      const defeated = this.effects.apply({
        definition,
        target: enemy,
        player,
        sourcePosition: position,
      })
      if (defeated) this.handleDefeat(enemy, definition, player, enemies)
    }
  }

  private handleDefeat(
    enemy: Enemy,
    sourceDefinition: SkillDefinition,
    player: Player,
    enemies: Enemy[],
  ): void {
    this.statuses.clearEnemy(enemy)
    player.gainExperience(GAME_CONFIG.enemy.xpReward)
    this.onEnemyDefeated()
    this.dispatch(
      SkillTrigger.OnKill,
      { position: enemy.object.position.clone(), sourceDefinition, target: enemy },
      player,
      enemies,
    )
  }

  private findNearestTarget(origin: THREE.Vector3, enemies: Enemy[], range: number): Enemy | undefined {
    let nearest: Enemy | undefined
    let nearestDistanceSquared = range ** 2
    for (const enemy of enemies) {
      if (enemy.health.isDead) continue
      const distanceSquared = origin.distanceToSquared(enemy.object.position)
      if (distanceSquared <= nearestDistanceSquared) {
        nearest = enemy
        nearestDistanceSquared = distanceSquared
      }
    }
    return nearest
  }

  private removeProjectile(index: number): void {
    const projectile = this.projectiles[index]
    this.scene.remove(projectile.object)
    projectile.dispose()
    this.projectiles.splice(index, 1)
  }

  private disposeOrbit(orbit: RuntimeOrbit): void {
    this.scene.remove(orbit.group)
    for (const child of orbit.group.children) {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) child.material.dispose()
      }
    }
  }

  private disposeMesh(mesh: THREE.Mesh): void {
    this.scene.remove(mesh)
    mesh.geometry.dispose()
    if (Array.isArray(mesh.material)) {
      for (const material of mesh.material) material.dispose()
    } else {
      mesh.material.dispose()
    }
  }
}
