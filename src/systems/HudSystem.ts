import type { Enemy } from '../entities/Enemy.ts'
import type { Player } from '../entities/Player.ts'
import type { Wallet } from '../economy/Wallet.ts'
import type { RoundSystem } from '../rounds/RoundSystem.ts'

export interface HudElements {
  health: HTMLElement
  level: HTMLElement
  xp: HTMLElement
  enemies: HTMLElement
  round: HTMLElement
  state: HTMLElement
  time: HTMLElement
  money: HTMLElement
  skills: HTMLElement
  gameOver: HTMLElement
}

export class HudSystem {
  private readonly elements: HudElements

  constructor(elements: HudElements) {
    this.elements = elements
  }

  update(
    player: Player,
    enemies: Enemy[],
    skillNames: readonly string[],
    rounds: RoundSystem,
    wallet: Wallet,
  ): void {
    this.elements.health.textContent = `HP ${player.health.current} / ${player.health.max}`
    this.elements.level.textContent = `Level ${player.level}`
    this.elements.xp.textContent = `XP ${player.xp} / ${player.xpForNextLevel}`
    this.elements.enemies.textContent = `Enemies ${enemies.length}`
    this.elements.round.textContent = `Round ${rounds.currentRound}`
    this.elements.state.textContent = rounds.state
    this.elements.time.textContent = `${rounds.remainingTime.toFixed(1)}s`
    this.elements.money.textContent = `Money ${wallet.money}`
    this.elements.skills.textContent = `Skills: ${skillNames.join(' · ')}`
    this.elements.gameOver.hidden = !player.health.isDead
  }
}
