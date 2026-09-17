import type * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { ElementEnemy } from '../entities/ElementEnemy.ts'
import { ALL_ELEMENTS, type ElementType } from '../elements/ElementType.ts'
import type { EnemySystem } from './EnemySystem.ts'

export class ElementEnemyDirector {
  readonly spawnedElementTypes = new Set<ElementType>()
  private readonly handledRounds = new Set<number>()
  private readonly enemies: EnemySystem
  private scheduledRound?: number
  private currentRound = 1
  private triggeredThisRound = false

  constructor(enemies: EnemySystem) { this.enemies = enemies }

  onRoundStarted(round: number): void {
    this.currentRound = round
    this.scheduledRound = undefined
    this.triggeredThisRound = false
    if (this.handledRounds.has(round)) return
    const count = GAME_CONFIG.elements.elementSpawnSchedule[round] ?? 0
    if (count <= 0) return
    this.handledRounds.add(round)
    this.scheduledRound = round
  }

  update(combatElapsed: number, playerPosition: THREE.Vector3): readonly ElementEnemy[] {
    if (!this.isSpawnScheduled || combatElapsed < GAME_CONFIG.elements.elementEnemySpawnDelaySeconds) return []
    return this.triggerScheduledSpawn(this.currentRound, playerPosition)
  }

  spawnSpecific(element: ElementType, playerPosition: THREE.Vector3): ElementEnemy | undefined {
    if (this.spawnedElementTypes.has(element)) return undefined
    this.spawnedElementTypes.add(element)
    return this.enemies.spawnElementEnemy(element, playerPosition)
  }

  triggerScheduledSpawn(round: number, playerPosition: THREE.Vector3): readonly ElementEnemy[] {
    if (this.triggeredThisRound && this.currentRound === round) return []
    this.triggeredThisRound = true
    this.scheduledRound = undefined
    return this.spawnNewElements(GAME_CONFIG.elements.elementSpawnSchedule[round] ?? 1, playerPosition)
  }

  get isSpawnScheduled(): boolean { return this.scheduledRound === this.currentRound && !this.triggeredThisRound }
  get hasTriggeredThisRound(): boolean { return this.triggeredThisRound }

  get activeElementEnemies(): readonly ElementEnemy[] {
    return this.enemies.enemies.filter((enemy): enemy is ElementEnemy => enemy instanceof ElementEnemy)
  }

  private spawnNewElements(count: number, playerPosition: THREE.Vector3): ElementEnemy[] {
    const remaining = ALL_ELEMENTS
      .filter((element) => !this.spawnedElementTypes.has(element))
      .sort(() => Math.random() - 0.5)
    return remaining.slice(0, Math.min(count, remaining.length)).map((element) => {
      this.spawnedElementTypes.add(element)
      return this.enemies.spawnElementEnemy(element, playerPosition)
    })
  }
}
