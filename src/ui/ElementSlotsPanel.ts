import { GAME_CONFIG } from '../config/gameConfig.ts'
import type { BuildState } from '../elements/BuildState.ts'
import type { ElementDiscardChoice } from '../elements/ElementInventory.ts'
import { ELEMENT_PRESENTATION } from '../elements/ElementType.ts'
import type { ElementType } from '../elements/ElementType.ts'

export interface ElementSlotsElements {
  root: HTMLElement
  current: HTMLElement
  currentSpecial: HTMLElement
  pendingRoot: HTMLElement
  slot1: HTMLElement
  slot2: HTMLElement
  link: HTMLElement
  ready: HTMLElement
  evolveButton: HTMLButtonElement
  evolveHint: HTMLElement
  tutorialRoot: HTMLElement
  tutorialElement: HTMLElement
  choiceRoot: HTMLElement
  choiceIncoming: HTMLElement
  choiceCurrent: HTMLElement
  discardPending1: HTMLButtonElement
  discardPending2: HTMLButtonElement
  discardIncoming: HTMLButtonElement
}

export class ElementSlotsPanel {
  private readonly elements: ElementSlotsElements
  private readonly onEvolve: () => void
  private readonly onDiscard: (choice: ElementDiscardChoice) => void
  private tutorialTimer?: number
  private tutorialShown = false

  constructor(
    elements: ElementSlotsElements,
    onEvolve: () => void,
    onDiscard: (choice: ElementDiscardChoice) => void,
  ) {
    this.elements = elements
    this.onEvolve = onEvolve
    this.onDiscard = onDiscard
    elements.evolveButton.addEventListener('click', this.onEvolveClick)
    elements.choiceRoot.addEventListener('click', this.onChoiceClick)
    window.addEventListener('keydown', this.onKeyDown)
  }

  render(
    state: BuildState,
    tier3Pending?: { element: ElementType; targetTier3Id: string },
    tier4Pending?: { element: ElementType; targetTier4Id: string },
  ): void {
    const inventory = state.elements
    const first = inventory.pending1?.element
    const second = inventory.pending2?.element
    const pending = inventory.pendingElement?.element
    const specialAvailable = inventory.specialFusionAvailable
    const elementPickupLocked = (state.currentEvolution?.tier ?? 0) >= 2
    const destinyPending = tier4Pending ?? tier3Pending
    const shownFirst = destinyPending?.element ?? first

    this.elements.current.textContent = state.currentEvolution?.glyph ?? '—'
    this.elements.currentSpecial.textContent = state.currentEvolution?.specialName ?? ''
    this.elements.currentSpecial.hidden = !state.currentEvolution?.specialName
    this.elements.pendingRoot.hidden = !shownFirst || (elementPickupLocked && !destinyPending)
    this.elements.slot1.textContent = shownFirst ? ELEMENT_PRESENTATION[shownFirst].glyph : ''
    this.elements.slot2.hidden = !second || Boolean(destinyPending)
    this.elements.link.hidden = !second || Boolean(destinyPending)
    this.elements.slot2.textContent = second ? ELEMENT_PRESENTATION[second].glyph : ''
    this.elements.slot1.style.setProperty('--element-color', shownFirst ? `#${ELEMENT_PRESENTATION[shownFirst].color.toString(16).padStart(6, '0')}` : '#75858a')
    this.elements.slot2.style.setProperty('--element-color', second ? `#${ELEMENT_PRESENTATION[second].color.toString(16).padStart(6, '0')}` : '#75858a')
    this.elements.root.classList.toggle('element-slots--rare', specialAvailable)
    this.elements.root.classList.toggle('element-slots--pending', Boolean(first) && !elementPickupLocked)
    this.elements.ready.hidden = !specialAvailable || elementPickupLocked
    this.elements.evolveHint.hidden = (!first || elementPickupLocked) && !destinyPending
    this.elements.evolveHint.textContent = tier4Pending ? 'E · 终极进化' : tier3Pending ? 'E · 特殊进化' : specialAvailable ? 'E · 特殊进化' : 'E · 进化'
    this.elements.evolveButton.disabled = destinyPending ? false : !first || Boolean(pending) || elementPickupLocked

    this.elements.choiceRoot.hidden = !pending
    if (pending) {
      const incomingGlyph = ELEMENT_PRESENTATION[pending].glyph
      const firstGlyph = first ? ELEMENT_PRESENTATION[first].glyph : '○'
      const secondGlyph = second ? ELEMENT_PRESENTATION[second].glyph : '○'
      this.elements.choiceIncoming.textContent = incomingGlyph
      this.elements.choiceCurrent.textContent = `${firstGlyph}    ${secondGlyph}`
      this.elements.discardPending1.textContent = `丢弃${firstGlyph}`
      this.elements.discardPending2.textContent = `丢弃${secondGlyph}`
      this.elements.discardIncoming.textContent = `丢弃${incomingGlyph}`
    }
  }

  dispose(): void {
    window.clearTimeout(this.tutorialTimer)
    this.elements.evolveButton.removeEventListener('click', this.onEvolveClick)
    this.elements.choiceRoot.removeEventListener('click', this.onChoiceClick)
    window.removeEventListener('keydown', this.onKeyDown)
  }

  notifyElementPickup(element: ElementType): void {
    if (this.tutorialShown) return
    this.tutorialShown = true
    this.elements.tutorialElement.textContent = ELEMENT_PRESENTATION[element].glyph
    this.elements.tutorialRoot.hidden = false
    window.clearTimeout(this.tutorialTimer)
    this.tutorialTimer = window.setTimeout(
      () => { this.elements.tutorialRoot.hidden = true },
      GAME_CONFIG.elements.evolutionTutorialDurationSeconds * 1000,
    )
  }

  dismissTutorial(): void {
    window.clearTimeout(this.tutorialTimer)
    this.elements.tutorialRoot.hidden = true
  }

  resetTutorial(): void {
    this.dismissTutorial()
    this.tutorialShown = false
  }

  get hasShownEvolutionTutorial(): boolean { return this.tutorialShown }

  private readonly onEvolveClick = (): void => {
    this.dismissTutorial()
    this.onEvolve()
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== GAME_CONFIG.elements.evolveKey || event.repeat) return
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
    this.dismissTutorial()
    this.onEvolve()
  }

  private readonly onChoiceClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const choice = target.dataset.discard as ElementDiscardChoice | undefined
    if (choice) this.onDiscard(choice)
  }
}
