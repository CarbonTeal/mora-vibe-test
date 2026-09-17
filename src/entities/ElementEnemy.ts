import * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { ELEMENT_PRESENTATION, type ElementType } from '../elements/ElementType.ts'
import { createElementGlyphSprite, disposeElementGlyphSprite } from '../elements/createElementGlyphSprite.ts'
import { Enemy } from './Enemy.ts'
import type { EnemyProjectileEmitter } from './EnemyArchetype.ts'

export class ElementEnemy extends Enemy {
  readonly elementType: ElementType
  private readonly aura: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  private readonly glyph: THREE.Sprite
  private elapsed = 0

  constructor(position: THREE.Vector3, elementType: ElementType, hpMultiplier = 1) {
    super(position, hpMultiplier * GAME_CONFIG.elements.enemyHpMultiplier, {
      radiusMultiplier: GAME_CONFIG.elements.enemySizeMultiplier,
      persistent: true,
      special: true,
      speedMultiplier: GAME_CONFIG.elements.enemySpeedMultiplier,
    })
    this.elementType = elementType
    const presentation = ELEMENT_PRESENTATION[elementType]
    this.object.name = `ElementEnemy:${elementType}`
    this.object.scale.setScalar(GAME_CONFIG.elements.enemySizeMultiplier)
    this.object.material.color.setHex(presentation.color)
    this.object.material.emissive.setHex(presentation.color)
    this.object.material.emissiveIntensity = 0.75

    this.aura = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.07, 8, 28),
      new THREE.MeshBasicMaterial({ color: presentation.color, transparent: true, opacity: 0.72 }),
    )
    this.aura.rotation.x = Math.PI / 2
    this.aura.position.y = -0.34
    this.glyph = createElementGlyphSprite(presentation.glyph, presentation.color, 1.15)
    this.glyph.position.y = 1.35
    this.object.add(this.aura, this.glyph)
  }

  override update(delta: number, playerPosition: THREE.Vector3, speedMultiplier = 1, attackRateMultiplier = 1, emitProjectile?: EnemyProjectileEmitter): void {
    super.update(delta, playerPosition, speedMultiplier, attackRateMultiplier, emitProjectile)
    this.elapsed += delta
    const pulse = 1 + Math.sin(this.elapsed * 4) * 0.08
    this.aura.scale.setScalar(pulse)
    this.aura.rotation.z += delta * 0.65
    this.object.material.emissiveIntensity = 0.65 + Math.sin(this.elapsed * 3) * 0.15
  }

  override dispose(): void {
    this.aura.geometry.dispose()
    this.aura.material.dispose()
    disposeElementGlyphSprite(this.glyph)
    super.dispose()
  }
}
