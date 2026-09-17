import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { Health } from '../entities/Health.ts'

/** A reusable, hit-activated world-space health indicator for high-value enemies. */
export class WorldHealthRing {
  readonly object = new THREE.Group()
  private readonly background: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  private readonly foregroundMaterial: THREE.MeshBasicMaterial
  private foreground?: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  private remaining = 0
  private readonly radiusMultiplier: number
  private readonly unsubscribe: () => void

  constructor(parent: THREE.Object3D, health: Health, radiusMultiplier = 1) {
    const config = GAME_CONFIG.enemy.healthRing
    const inner = config.innerRadius * radiusMultiplier
    const outer = config.outerRadius * radiusMultiplier
    this.radiusMultiplier = radiusMultiplier
    this.object.name = 'WorldHealthRing'
    this.object.rotation.x = -Math.PI / 2
    this.object.visible = false

    this.background = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, config.segments),
      new THREE.MeshBasicMaterial({
        color: config.backgroundColor,
        transparent: true,
        opacity: 0.95,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    )
    this.foregroundMaterial = new THREE.MeshBasicMaterial({
      color: config.foregroundColor,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })
    this.background.renderOrder = config.renderOrder
    this.object.add(this.background)
    parent.add(this.object)
    this.syncGroundHeight(parent)
    this.setProgress(1, inner, outer)
    this.unsubscribe = health.subscribeDamage(() => this.onDamage(health.current, health.max))
  }

  update(delta: number, parent: THREE.Object3D): void {
    this.syncGroundHeight(parent)
    this.remaining = Math.max(0, this.remaining - delta)
    this.object.visible = this.remaining > 0
  }

  dispose(): void {
    this.unsubscribe()
    this.object.remove(this.background)
    this.background.geometry.dispose()
    this.background.material.dispose()
    if (this.foreground) {
      this.object.remove(this.foreground)
      this.foreground.geometry.dispose()
    }
    this.foregroundMaterial.dispose()
  }

  private onDamage(current: number, maximum: number): void {
    const config = GAME_CONFIG.enemy.healthRing
    const inner = config.innerRadius * this.radiusMultiplier
    const outer = config.outerRadius * this.radiusMultiplier
    this.setProgress(maximum > 0 ? current / maximum : 0, inner, outer)
    this.remaining = config.visibleDuration
    this.object.visible = true
  }

  private setProgress(progress: number, inner: number, outer: number): void {
    const theta = Math.max(0.001, Math.min(1, progress)) * Math.PI * 2
    if (this.foreground) {
      this.object.remove(this.foreground)
      this.foreground.geometry.dispose()
    }
    this.foreground = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, GAME_CONFIG.enemy.healthRing.segments, 1, Math.PI / 2, theta),
      this.foregroundMaterial,
    )
    this.foreground.renderOrder = GAME_CONFIG.enemy.healthRing.renderOrder + 1
    this.object.add(this.foreground)
  }

  /**
   * Enemy meshes use different scales.  Keeping this in world-space prevents an
   * element enemy's second scale pass from pushing the indicator under the floor.
   */
  private syncGroundHeight(parent: THREE.Object3D): void {
    parent.updateWorldMatrix(true, false)
    const worldPosition = parent.getWorldPosition(new THREE.Vector3())
    const worldScale = parent.getWorldScale(new THREE.Vector3())
    this.object.position.y = (GAME_CONFIG.enemy.healthRing.worldHeight - worldPosition.y) /
      Math.max(0.001, worldScale.y)
  }
}
