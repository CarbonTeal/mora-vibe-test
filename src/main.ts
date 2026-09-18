import './style.css'
import { Game } from './game/Game.ts'
import { DebugPanel } from './debug/DebugPanel.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root element')
}

type GameMode = 'normal' | 'dev'
const RESTART_MODE_KEY = 'mora-restart-mode'

app.innerHTML = `
  <main class="game-shell">
    <canvas id="game-canvas" aria-label="3D roguelike game"></canvas>
    <section id="start-screen" class="start-screen" aria-label="Start game">
      <div class="start-screen__card">
        <h1>元素魔导士</h1>
        <button id="start-game" type="button">开始游戏</button>
      </div>
      <button id="start-dev" class="start-screen__dev" type="button">DEV MODE</button>
    </section>
    <section class="hud hud--player" aria-live="polite">
      <div class="hud__title">Mora Prototype</div>
      <div class="hud__stats">
        <span id="hud-health">HP 100 / 100</span>
        <span id="hud-xp">XP 0 / 60</span>
        <span id="hud-money">$ 0</span>
        <span id="hud-level" class="hud__dev-only">Level 1</span>
        <span id="hud-enemies" class="hud__dev-only">Enemies 0</span>
        <span id="hud-state" class="hud__dev-only">Combat</span>
      </div>
      <div id="hud-skills" class="hud__skills hud__dev-only">Skills: Basic Projectile</div>
      <div class="hud__hint">WASD 移动 · 自动瞄准与攻击</div>
    </section>
    <section class="hud-round" aria-live="polite">
      <strong id="hud-round">ROUND 1 / 20</strong>
      <span id="hud-time">00:30</span>
    </section>
    <section id="fusion-feedback" class="fusion-feedback" aria-live="assertive">
      <small id="fusion-source"></small>
      <strong id="fusion-glyph"></strong>
      <span id="fusion-name"></span>
    </section>
    <div id="combat-feedback" class="combat-feedback" aria-live="polite"></div>
    <section id="element-slots" class="element-slots" aria-label="Element evolution">
      <div class="element-slots__label">CURRENT</div>
      <div id="current-evolution" class="element-slots__current">—</div>
      <div id="current-evolution-special" class="element-slots__special" hidden></div>
      <div id="pending-elements" class="element-slots__pair" hidden>
        <span id="element-slot-1" class="element-slot"></span>
        <span id="element-slots-link" class="element-slots__link" hidden>+</span>
        <span id="element-slot-2" class="element-slot" hidden></span>
      </div>
      <div id="rare-fusion-ready" class="element-slots__ready" hidden>SPECIAL FUSION AVAILABLE</div>
      <div id="pending-evolve-hint" class="element-slots__evolve-hint" hidden>E · 进化</div>
      <button id="element-evolve" class="element-evolve" type="button">ELEMENT EVOLVE / 元素进化 <kbd>E</kbd></button>
    </section>
    <section id="evolution-tutorial" class="evolution-tutorial" hidden aria-live="assertive">
      <strong>获得元素：<span id="tutorial-element"></span></strong>
      <span>按 E 进行进化</span>
    </section>
    <section id="element-choice" class="element-choice" hidden>
      <div class="element-choice__card">
        <div class="element-choice__eyebrow">元素槽已满</div>
        <h2>获得：<span id="choice-incoming"></span></h2>
        <p>当前：<span id="choice-current"></span></p>
        <strong>请选择丢弃：</strong>
        <div class="element-choice__actions">
          <button id="discard-slot-1" type="button" data-discard="pending1"></button>
          <button id="discard-slot-2" type="button" data-discard="pending2"></button>
          <button id="discard-incoming" type="button" data-discard="incoming"></button>
        </div>
      </div>
    </section>
    <section id="shop-panel" class="shop-panel" hidden></section>
    <section id="game-over" class="game-over" hidden>
      <strong>游戏结束</strong>
      <button id="restart-game-over" type="button">重新开始</button>
    </section>
    <section id="victory-screen" class="game-over victory-screen" hidden>
      <strong>胜利</strong>
      <span>20轮完成</span>
      <button id="restart-game" type="button">重新开始</button>
    </section>
    <aside id="debug-panel" class="debug-panel" hidden></aside>
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
    source: document.querySelector<HTMLElement>('#fusion-source')!,
    glyph: document.querySelector<HTMLElement>('#fusion-glyph')!,
    name: document.querySelector<HTMLElement>('#fusion-name')!,
  },
  elementSlots: {
    root: document.querySelector<HTMLElement>('#element-slots')!,
    current: document.querySelector<HTMLElement>('#current-evolution')!,
    currentSpecial: document.querySelector<HTMLElement>('#current-evolution-special')!,
    pendingRoot: document.querySelector<HTMLElement>('#pending-elements')!,
    slot1: document.querySelector<HTMLElement>('#element-slot-1')!,
    slot2: document.querySelector<HTMLElement>('#element-slot-2')!,
    link: document.querySelector<HTMLElement>('#element-slots-link')!,
    ready: document.querySelector<HTMLElement>('#rare-fusion-ready')!,
    evolveButton: document.querySelector<HTMLButtonElement>('#element-evolve')!,
    evolveHint: document.querySelector<HTMLElement>('#pending-evolve-hint')!,
    tutorialRoot: document.querySelector<HTMLElement>('#evolution-tutorial')!,
    tutorialElement: document.querySelector<HTMLElement>('#tutorial-element')!,
    choiceRoot: document.querySelector<HTMLElement>('#element-choice')!,
    choiceIncoming: document.querySelector<HTMLElement>('#choice-incoming')!,
    choiceCurrent: document.querySelector<HTMLElement>('#choice-current')!,
    discardPending1: document.querySelector<HTMLButtonElement>('#discard-slot-1')!,
    discardPending2: document.querySelector<HTMLButtonElement>('#discard-slot-2')!,
    discardIncoming: document.querySelector<HTMLButtonElement>('#discard-incoming')!,
  },
  shopRoot: document.querySelector<HTMLElement>('#shop-panel')!,
  combatFeedback: document.querySelector<HTMLElement>('#combat-feedback')!,
  startScreen: document.querySelector<HTMLElement>('#start-screen')!,
  victoryScreen: document.querySelector<HTMLElement>('#victory-screen')!,
})

const debugRoot = document.querySelector<HTMLElement>('#debug-panel')
const shell = document.querySelector<HTMLElement>('.game-shell')!
const debugPanel = debugRoot ? new DebugPanel(debugRoot, game.getDebugActions()) : undefined
let currentMode: GameMode = 'normal'

const startRun = (mode: GameMode): void => {
  currentMode = mode
  shell.dataset.gameMode = mode
  if (debugRoot) debugRoot.hidden = mode !== 'dev'
  game.beginRun()
}

const restartRun = (): void => {
  sessionStorage.setItem(RESTART_MODE_KEY, currentMode)
  window.location.reload()
}

document.querySelector<HTMLButtonElement>('#start-game')!.addEventListener('click', () => startRun('normal'))
document.querySelector<HTMLButtonElement>('#start-dev')!.addEventListener('click', () => startRun('dev'))
document.querySelector<HTMLButtonElement>('#restart-game')!.addEventListener('click', restartRun)
document.querySelector<HTMLButtonElement>('#restart-game-over')!.addEventListener('click', restartRun)

game.start()

const restartMode = sessionStorage.getItem(RESTART_MODE_KEY)
if (restartMode === 'normal' || restartMode === 'dev') {
  sessionStorage.removeItem(RESTART_MODE_KEY)
  startRun(restartMode)
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    debugPanel?.dispose()
    game.dispose()
  })
}
