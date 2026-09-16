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
