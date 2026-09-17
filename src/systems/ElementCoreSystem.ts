import * as THREE from 'three'
import { ElementCore } from '../entities/ElementCore.ts'
import type { Player } from '../entities/Player.ts'
import type { ElementType } from '../elements/ElementType.ts'

export class ElementCoreSystem {
  readonly cores: ElementCore[] = []
  private readonly scene: THREE.Scene
  private readonly onPickup: (element: ElementType) => void

  constructor(
    scene: THREE.Scene,
    onPickup: (element: ElementType) => void,
  ) {
    this.scene = scene
    this.onPickup = onPickup
  }

  spawn(element: ElementType, position: THREE.Vector3): ElementCore {
    const core = new ElementCore(element, position)
    this.cores.push(core)
    this.scene.add(core.object)
    return core
  }

  update(delta: number, player: Player, allowPickup: boolean): void {
    for (let index = this.cores.length - 1; index >= 0; index -= 1) {
      const core = this.cores[index]
      core.update(delta)
      const distance = core.object.position.distanceTo(player.object.position)
      if (allowPickup && distance <= core.pickupRadius + player.radius) {
        this.onPickup(core.elementType)
        this.remove(index)
        return
      } else if (core.isExpired) {
        this.remove(index)
      }
    }
  }

  collectAll(): readonly ElementType[] {
    const collected: ElementType[] = []
    for (let index = this.cores.length - 1; index >= 0; index -= 1) {
      const element = this.cores[index].elementType
      collected.push(element)
      this.onPickup(element)
      this.remove(index)
    }
    return collected
  }

  dispose(): void {
    while (this.cores.length > 0) this.remove(this.cores.length - 1)
  }

  private remove(index: number): void {
    const core = this.cores[index]
    this.scene.remove(core.object)
    core.dispose()
    this.cores.splice(index, 1)
  }
}
