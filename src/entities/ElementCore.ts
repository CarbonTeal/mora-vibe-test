import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { ELEMENT_PRESENTATION, type ElementType } from '../elements/ElementType.ts'
import { createElementGlyphSprite, disposeElementGlyphSprite } from '../elements/createElementGlyphSprite.ts'

export class ElementCore {
  readonly object = new THREE.Group()
  readonly elementType: ElementType
  readonly pickupRadius = GAME_CONFIG.elements.corePickupRadius
  readonly purpose: 'normal' | 'tier3' | 'tier4'
  readonly targetTier3Id?: string
  readonly targetTier4Id?: string
  private readonly core: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshStandardMaterial>
  private readonly ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  private readonly glyph: THREE.Sprite
  private remaining = GAME_CONFIG.elements.coreLifetime
  private elapsed = 0
  private rejectedCooldown = 0

  constructor(elementType: ElementType, position: THREE.Vector3, options: { purpose?: 'normal' | 'tier3' | 'tier4'; targetTier3Id?: string; targetTier4Id?: string } = {}) {
    this.elementType = elementType
    this.purpose = options.purpose ?? 'normal'
    this.targetTier3Id = options.targetTier3Id
    this.targetTier4Id = options.targetTier4Id
    const presentation = ELEMENT_PRESENTATION[elementType]
    this.object.name = `ElementCore:${elementType}:${this.purpose}`
    this.object.position.copy(position)
    this.object.position.y = 0

    this.core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({
        color: presentation.color,
        emissive: presentation.color,
        emissiveIntensity: 1.2,
        roughness: 0.25,
      }),
    )
    this.core.position.y = 0.72
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.045, 8, 28),
      new THREE.MeshBasicMaterial({ color: presentation.color, transparent: true, opacity: 0.85 }),
    )
    this.ring.rotation.x = Math.PI / 2
    this.ring.position.y = 0.28
    this.glyph = createElementGlyphSprite(presentation.glyph, presentation.color, 0.9)
    this.glyph.position.y = 1.45
    this.object.add(this.core, this.ring, this.glyph)
  }

  update(delta: number): void {
    this.elapsed += delta
    this.remaining -= delta
    this.core.rotation.y += delta * 1.8
    this.core.position.y = 0.72 + Math.sin(this.elapsed * 3) * 0.12
    this.ring.rotation.z += delta
    this.rejectedCooldown = Math.max(0, this.rejectedCooldown - delta)
    this.core.material.emissiveIntensity = this.rejectedCooldown > 0 ? 2.2 : 1.2
  }

  get isExpired(): boolean { return this.remaining <= 0 }
  get canAttemptPickup(): boolean { return this.rejectedCooldown <= 0 }

  rejectPickup(): void {
    this.rejectedCooldown = 0.65
  }

  dispose(): void {
    this.core.geometry.dispose()
    this.core.material.dispose()
    this.ring.geometry.dispose()
    this.ring.material.dispose()
    disposeElementGlyphSprite(this.glyph)
  }
}
