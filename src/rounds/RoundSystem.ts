import { GAME_CONFIG } from '../config/gameConfig.ts'

type ValueOf<T> = T[keyof T]

export const GameState = {
  StartScreen: 'StartScreen',
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
  remainingTime: number = this.getRoundDuration(1)
  state: GameState = GameState.StartScreen
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

  beginRun(): void {
    if (this.state !== GameState.StartScreen) return
    this.currentRound = 1
    this.startRound()
  }

  returnToStartScreen(): void {
    this.setState(GameState.StartScreen)
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

  get roundDuration(): number { return this.getRoundDuration(this.currentRound) }
  get combatElapsed(): number { return this.state === GameState.Combat ? this.roundDuration - this.remainingTime : 0 }

  setRemainingTime(seconds: number): void {
    if (this.state !== GameState.Combat) return
    this.remainingTime = Math.max(0, Math.min(this.roundDuration, seconds))
  }

  /** Development-only time positioning for deterministic combat-delay checks. */
  setCombatElapsed(seconds: number): void {
    this.setRemainingTime(this.roundDuration - seconds)
  }

  /** Development-only round positioning. It deliberately does not change the current game state. */
  forceRound(round: number): void {
    this.currentRound = Math.max(1, Math.min(GAME_CONFIG.rounds.plannedCount, Math.floor(round)))
    this.remainingTime = this.roundDuration
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

  private getRoundDuration(round: number): number {
    return round === 1 ? GAME_CONFIG.rounds.firstRoundDuration : GAME_CONFIG.rounds.normalRoundDuration
  }
}
