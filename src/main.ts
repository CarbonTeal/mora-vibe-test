import './style.css'
import { Game } from './game/Game.ts'
import { DebugPanel } from './debug/DebugPanel.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root element')
}

const debugMarkup = import.meta.env.DEV ? '<aside id="debug-panel" class="debug-panel"></aside>' : ''

app.innerHTML = `
  <main class="game-shell">
    <canvas id="game-canvas" aria-label="3D roguelike game"></canvas>
    <section class="hud" aria-live="polite">
      <div class="hud__title">Mora Prototype</div>
      <div class="hud__stats">
        <span id="hud-health">HP 100 / 100</span>
        <span id="hud-level">Level 1</span>
        <span id="hud-xp">XP 0 / 60</span>
        <span id="hud-enemies">Enemies 0</span>
        <span id="hud-round">Round 1</span>
        <span id="hud-state">Combat</span>
        <span id="hud-time">60.0s</span>
        <span id="hud-money">Money 0</span>
      </div>
      <div id="hud-skills" class="hud__skills">Skills: Basic Projectile</div>
      <div class="hud__hint">WASD 移动 · 自动瞄准与攻击</div>
    </section>
    <section id="fusion-feedback" class="fusion-feedback" aria-live="assertive">
      <strong id="fusion-glyph"></strong>
      <span id="fusion-name"></span>
    </section>
    <section id="shop-panel" class="shop-panel" hidden></section>
    <section id="game-over" class="game-over" hidden>
      <strong>Run Over</strong>
      <span>刷新页面重新开始</span>
    </section>
    ${debugMarkup}
  </main>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')

if (!canvas) {
  throw new Error('Missing game canvas')
}

const game = new Game(canvas, {
  hud: {
    health: document.querySelector<HTMLElement>('#hud-health')!,
    level: document.querySelector<HTMLElement>('#hud-level')!,
    xp: document.querySelector<HTMLElement>('#hud-xp')!,
    enemies: document.querySelector<HTMLElement>('#hud-enemies')!,
    round: document.querySelector<HTMLElement>('#hud-round')!,
    state: document.querySelector<HTMLElement>('#hud-state')!,
    time: document.querySelector<HTMLElement>('#hud-time')!,
    money: document.querySelector<HTMLElement>('#hud-money')!,
    skills: document.querySelector<HTMLElement>('#hud-skills')!,
    gameOver: document.querySelector<HTMLElement>('#game-over')!,
  },
  fusion: {
    root: document.querySelector<HTMLElement>('#fusion-feedback')!,
    glyph: document.querySelector<HTMLElement>('#fusion-glyph')!,
    name: document.querySelector<HTMLElement>('#fusion-name')!,
  },
  shopRoot: document.querySelector<HTMLElement>('#shop-panel')!,
})

const debugRoot = document.querySelector<HTMLElement>('#debug-panel')
const debugPanel = import.meta.env.DEV && debugRoot
  ? new DebugPanel(debugRoot, game.getDebugActions())
  : undefined

game.start()

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    debugPanel?.dispose()
    game.dispose()
  })
}
