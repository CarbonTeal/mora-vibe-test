import * as THREE from 'three'
import { ElementCore } from '../entities/ElementCore.ts'
import type { Player } from '../entities/Player.ts'
import type { ElementType } from '../elements/ElementType.ts'
import type { ElementCore as ElementCoreEntity } from '../entities/ElementCore.ts'

export class ElementCoreSystem {
  readonly cores: ElementCore[] = []
  private readonly scene: THREE.Scene
  private readonly onPickup: (core: ElementCoreEntity) => boolean

  constructor(
    scene: THREE.Scene,
    onPickup: (core: ElementCoreEntity) => boolean,
  ) {
    this.scene = scene
    this.onPickup = onPickup
  }

  spawn(element: ElementType, position: THREE.Vector3, options: { purpose?: 'normal' | 'tier3'; targetTier3Id?: string } = {}): ElementCore {
    const core = new ElementCore(element, position, options)
    this.cores.push(core)
    this.scene.add(core.object)
    return core
  }

  update(delta: number, player: Player, allowPickup: boolean): void {
    for (let index = this.cores.length - 1; index >= 0; index -= 1) {
      const core = this.cores[index]
      core.update(delta)
      const distance = core.object.position.distanceTo(player.object.position)
      if (allowPickup && core.canAttemptPickup && distance <= core.pickupRadius + player.radius) {
        if (this.onPickup(core)) this.remove(index)
        else core.rejectPickup()
        return
      } else if (core.isExpired) {
        this.remove(index)
      }
    }
  }

  collectAll(): readonly ElementType[] {
    const collected: ElementType[] = []
    // Resolve in drop order so RoundEnd preserves ordered build semantics.
    for (const core of [...this.cores]) {
      const index = this.cores.indexOf(core)
      if (index < 0) continue
      collected.push(core.elementType)
      if (this.onPickup(core)) this.remove(index)
    }
    return collected
  }

  dispose(): void {
    while (this.cores.length > 0) this.remove(this.cores.length - 1)
  }

  discardAll(): void {
    while (this.cores.length > 0) this.remove(this.cores.length - 1)
  }

  private remove(index: number): void {
    const core = this.cores[index]
    this.scene.remove(core.object)
    core.dispose()
    this.cores.splice(index, 1)
  }
}
