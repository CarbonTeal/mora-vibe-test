import { GAME_CONFIG } from '../config/gameConfig.ts'

type ValueOf<T> = T[keyof T]

export const GameState = {
  Combat: 'Combat',
  RoundEnd: 'RoundEnd',
  Shop: 'Shop',
  GameOver: 'GameOver',
} as const
export type GameState = ValueOf<typeof GameState>

export interface RoundDifficulty {
  enemyHpMultiplier: number
  enemySpeedMultiplier: number
  spawnRateMultiplier: number
}

type StateListener = (state: GameState) => void

export class RoundSystem {
  currentRound = 1
  readonly roundDuration = GAME_CONFIG.rounds.duration
  remainingTime: number = this.roundDuration
  state: GameState = GameState.Combat
  private readonly listeners = new Set<StateListener>()

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  update(delta: number): void {
    if (this.state !== GameState.Combat) return
    this.remainingTime = Math.max(0, this.remainingTime - delta)
    if (this.remainingTime <= 0) this.endRound()
  }

  startRound(): void {
    this.remainingTime = this.roundDuration
    this.setState(GameState.Combat)
  }

  endRound(): void {
    if (this.state !== GameState.Combat) return
    this.remainingTime = 0
    this.setState(GameState.RoundEnd)
  }

  enterShop(): void {
    if (this.state !== GameState.RoundEnd) return
    this.setState(GameState.Shop)
  }

  startNextRound(): void {
    if (this.state !== GameState.Shop) return
    this.currentRound += 1
    this.startRound()
  }

  enterGameOver(): void {
    this.setState(GameState.GameOver)
  }

  getDifficulty(): RoundDifficulty {
    const roundIndex = this.currentRound - 1
    const scaling = GAME_CONFIG.rounds.difficulty
    return {
      enemyHpMultiplier: 1 + roundIndex * scaling.enemyHpPerRound,
      enemySpeedMultiplier: 1 + roundIndex * scaling.enemySpeedPerRound,
      spawnRateMultiplier: 1 + roundIndex * scaling.spawnRatePerRound,
    }
  }

  private setState(state: GameState): void {
    this.state = state
    for (const listener of this.listeners) listener(state)
  }
}
