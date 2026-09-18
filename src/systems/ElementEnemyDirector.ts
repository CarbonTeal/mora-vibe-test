import type * as THREE from 'three'
import { GAME_CONFIG } from '../config/gameConfig.ts'
import { ElementEnemy } from '../entities/ElementEnemy.ts'
import { ALL_ELEMENTS, type ElementType } from '../elements/ElementType.ts'
import type { EnemySystem } from './EnemySystem.ts'
import { getTier3ForBaseTier2 } from '../skills/SkillRegistry.ts'

export class ElementEnemyDirector {
  readonly spawnedElementTypes = new Set<ElementType>()
  private readonly handledRounds = new Set<number>()
  private readonly enemies: EnemySystem
  private scheduledRound?: number
  private currentRound = 1
  private triggeredThisRound = false
  private tier3TargetId?: string
  private tier3RequiredElement?: ElementType

  constructor(enemies: EnemySystem) { this.enemies = enemies }

  onRoundStarted(round: number): void {
    this.currentRound = round
    this.scheduledRound = undefined
    this.triggeredThisRound = false
    this.tier3TargetId = undefined
    this.tier3RequiredElement = undefined
    if (this.handledRounds.has(round)) return
    if (round === 9) {
      this.handledRounds.add(round)
      this.scheduledRound = round
      return
    }
    const count = GAME_CONFIG.elements.elementSpawnSchedule[round] ?? 0
    if (count <= 0) return
    this.handledRounds.add(round)
    this.scheduledRound = round
  }

  update(combatElapsed: number, playerPosition: THREE.Vector3, currentEvolutionId = '', currentEvolutionTier = 0): readonly ElementEnemy[] {
    if (!this.isSpawnScheduled || combatElapsed < GAME_CONFIG.elements.elementEnemySpawnDelaySeconds) return []
    if (this.currentRound === 9) {
      if (currentEvolutionTier !== 2) return []
      return this.spawnTier3Destiny(currentEvolutionId, playerPosition)
    }
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

  spawnTier3Destiny(baseTier2Id: string, playerPosition: THREE.Vector3): readonly ElementEnemy[] {
    if (this.triggeredThisRound || this.currentRound !== 9) return []
    const target = getTier3ForBaseTier2(baseTier2Id)
    if (!target?.requiredElement) return []
    this.triggeredThisRound = true
    this.scheduledRound = undefined
    this.tier3TargetId = target.id
    this.tier3RequiredElement = target.requiredElement
    // Destiny material intentionally bypasses the ordinary non-repeat set.
    return [this.enemies.spawnElementEnemy(target.requiredElement, playerPosition, target.id)]
  }

  get isSpawnScheduled(): boolean { return this.scheduledRound === this.currentRound && !this.triggeredThisRound }
  get hasTriggeredThisRound(): boolean { return this.triggeredThisRound }
  get targetTier3Id(): string | undefined { return this.tier3TargetId }
  get requiredTier3Element(): ElementType | undefined { return this.tier3RequiredElement }

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
