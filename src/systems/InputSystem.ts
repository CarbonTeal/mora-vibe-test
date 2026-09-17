import * as THREE from 'three'

const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD'])

export class InputSystem {
  private readonly pressed = new Set<string>()

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onBlur)
  }

  getMovementDirection(): THREE.Vector2 {
    const direction = new THREE.Vector2(
      Number(this.pressed.has('KeyD')) - Number(this.pressed.has('KeyA')),
      Number(this.pressed.has('KeyS')) - Number(this.pressed.has('KeyW')),
    )
    return direction.lengthSq() > 0 ? direction.normalize() : direction
  }

  clearMovement(): void { this.pressed.clear() }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onBlur)
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (MOVEMENT_KEYS.has(event.code)) {
      event.preventDefault()
      this.pressed.add(event.code)
    }
  }

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.code)
  }

  private readonly onBlur = (): void => {
    this.pressed.clear()
  }
}
