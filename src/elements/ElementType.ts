type ValueOf<T> = T[keyof T]

export const ElementType = {
  Fire: 'Fire',
  Water: 'Water',
  Earth: 'Earth',
  Wind: 'Wind',
  Light: 'Light',
  Dark: 'Dark',
} as const

export type ElementType = ValueOf<typeof ElementType>

export const ALL_ELEMENTS: readonly ElementType[] = Object.values(ElementType)

export interface ElementPresentation {
  glyph: string
  color: number
  name: string
}

export const ELEMENT_PRESENTATION: Readonly<Record<ElementType, ElementPresentation>> = {
  Fire: { glyph: '火', color: 0xff5a36, name: 'Fire' },
  Water: { glyph: '水', color: 0x3aa8ff, name: 'Water' },
  Earth: { glyph: '土', color: 0xc99754, name: 'Earth' },
  Wind: { glyph: '风', color: 0x79e8bd, name: 'Wind' },
  Light: { glyph: '光', color: 0xffef8b, name: 'Light' },
  Dark: { glyph: '暗', color: 0x9b72ff, name: 'Dark' },
}
