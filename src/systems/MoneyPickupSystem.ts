import * as THREE from 'three'
import type { Wallet } from '../economy/Wallet.ts'
import { MoneyPickup } from '../economy/MoneyPickup.ts'
import type { Player } from '../entities/Player.ts'

export interface MoneyPickupEvents {
  onManualCollected?: (amount: number) => void
  onRoundEndCollected?: (total: number, collected: number) => void
}

export class MoneyPickupSystem {
  readonly pickups: MoneyPickup[] = []
  private readonly scene: THREE.Scene
  private readonly events: MoneyPickupEvents

  constructor(scene: THREE.Scene, events: MoneyPickupEvents = {}) {
    this.scene = scene
    this.events = events
  }

  spawn(position: THREE.Vector3, amount = 1): void {
    const pickup = new MoneyPickup(position, amount)
    this.pickups.push(pickup)
    this.scene.add(pickup.object)
  }

  spawnMany(position: THREE.Vector3, count: number): void {
    for (let index = 0; index < count; index += 1) {
      const angle = index / Math.max(1, count) * Math.PI * 2
      const radius = 1.5 + (index % 4) * 0.45
      this.spawn(position.clone().add(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)))
    }
  }

  update(delta: number, player: Player, wallet: Wallet): void {
    for (let index = this.pickups.length - 1; index >= 0; index -= 1) {
      const pickup = this.pickups[index]
      if (pickup.update(delta, player.object.position, player.stats.pickupRange)) {
        wallet.add(pickup.amount)
        this.events.onManualCollected?.(pickup.amount)
        this.remove(index)
      } else if (pickup.remaining <= 0) {
        this.remove(index)
      }
    }
  }

  collectAtRoundEnd(wallet: Wallet, ratio: number): { total: number; collected: number } {
    const total = this.pickups.reduce((sum, pickup) => sum + pickup.amount, 0)
    const collected = Math.floor(total * Math.max(0, Math.min(1, ratio)))
    if (collected > 0) wallet.add(collected)
    this.events.onRoundEndCollected?.(total, collected)
    for (let index = this.pickups.length - 1; index >= 0; index -= 1) this.remove(index)
    return { total, collected }
  }

  dispose(): void {
    for (let index = this.pickups.length - 1; index >= 0; index -= 1) this.remove(index)
  }

  private remove(index: number): void {
    const pickup = this.pickups[index]
    this.scene.remove(pickup.object)
    pickup.dispose()
    this.pickups.splice(index, 1)
  }
}
