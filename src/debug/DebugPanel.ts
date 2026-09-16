import { ElementType, type ElementType as ElementValue } from '../elements/ElementType.ts'
import type { DebugActions } from './DebugTypes.ts'

export class DebugPanel {
  private readonly root: HTMLElement
  private readonly actions: DebugActions
  private animationFrame = 0

  constructor(root: HTMLElement, actions: DebugActions) {
    this.root = root
    this.actions = actions
    this.root.innerHTML = `
      <div class="debug-panel__header">DEBUG</div>
      <pre class="debug-panel__state" data-debug-state></pre>
      <div class="debug-panel__group">
        ${Object.values(ElementType).map((element) => `
          <button type="button" data-element="${element}">Add ${element}</button>
        `).join('')}
      </div>
      <div class="debug-panel__group">
        <button type="button" data-action="toggle-mode">Toggle Simultaneous Mode</button>
        <button type="button" data-action="reset-build">Clear Elements / Reset Build</button>
      </div>
      <div class="debug-panel__group debug-panel__group--grid">
        <button type="button" data-action="xp">Give 100 XP</button>
        <button type="button" data-action="money">Give 100 Money</button>
        <button type="button" data-action="spawn-10">Spawn 10 Enemies</button>
        <button type="button" data-action="spawn-50">Spawn 50 Enemies</button>
        <button type="button" data-action="invincible">Toggle Invincible</button>
        <button type="button" data-action="kill-all">Kill All Enemies</button>
        <button type="button" data-action="skip-round">Skip To Round End</button>
      </div>
    `
    this.root.addEventListener('click', this.onClick)
    this.animationFrame = requestAnimationFrame(this.render)
  }

  dispose(): void {
    cancelAnimationFrame(this.animationFrame)
    this.root.removeEventListener('click', this.onClick)
  }

  private readonly render = (): void => {
    const state = this.actions.getSnapshot()
    const output = this.root.querySelector<HTMLElement>('[data-debug-state]')
    if (output) {
      output.textContent = [
        `Round: ${state.round}`,
        `State: ${state.state}`,
        `Time: ${state.remainingTime.toFixed(1)}s`,
        `Money: ${state.money}`,
        `Level / XP: ${state.level} / ${state.xp} / ${state.xpForNextLevel}`,
        `Mode: ${state.fusionMode}`,
        `Invincible: ${state.invincible ? 'ON' : 'OFF'}`,
        `Elements: ${state.elements.join(' → ') || 'None'}`,
        `Last Fusion: ${state.recentFusion || 'None'}`,
      ].join('\n')
    }
    this.animationFrame = requestAnimationFrame(this.render)
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const element = target.dataset.element as ElementValue | undefined
    if (element) {
      this.actions.addElement(element)
      return
    }

    switch (target.dataset.action) {
      case 'toggle-mode': this.actions.toggleSimultaneousMode(); break
      case 'reset-build': this.actions.resetBuild(); break
      case 'xp': this.actions.giveXp(100); break
      case 'money': this.actions.giveMoney(100); break
      case 'spawn-10': this.actions.spawnEnemies(10); break
      case 'spawn-50': this.actions.spawnEnemies(50); break
      case 'invincible': this.actions.toggleInvincible(); break
      case 'kill-all': this.actions.killAllEnemies(); break
      case 'skip-round': this.actions.skipToRoundEnd(); break
    }
  }
}
