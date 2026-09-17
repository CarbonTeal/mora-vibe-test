import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { ELEMENT_PRESENTATION, type ElementType } from '../elements/ElementType.ts'
import { createElementGlyphSprite, disposeElementGlyphSprite } from '../elements/createElementGlyphSprite.ts'

export class ElementCore {
  readonly object = new THREE.Group()
  readonly elementType: ElementType
  readonly pickupRadius = GAME_CONFIG.elements.corePickupRadius
  private readonly core: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshStandardMaterial>
  private readonly ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  private readonly glyph: THREE.Sprite
  private remaining = GAME_CONFIG.elements.coreLifetime
  private elapsed = 0

  constructor(elementType: ElementType, position: THREE.Vector3) {
    this.elementType = elementType
    const presentation = ELEMENT_PRESENTATION[elementType]
    this.object.name = `ElementCore:${elementType}`
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
  }

  get isExpired(): boolean { return this.remaining <= 0 }

  dispose(): void {
    this.core.geometry.dispose()
    this.core.material.dispose()
    this.ring.geometry.dispose()
    this.ring.material.dispose()
    disposeElementGlyphSprite(this.glyph)
  }
}
