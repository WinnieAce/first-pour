import type { Unit } from '../content/schema'

export type DisplayUnits = 'ml' | 'oz'

export const MIN_SERVINGS = 1
export const MAX_SERVINGS = 8

const ML_PER_OZ = 30
const QUARTERS = ['', '¼', '½', '¾']

export function clampServings(n: number): number {
  if (Number.isNaN(n)) return MIN_SERVINGS
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(n)))
}

export function scaleAmount(amount: number, servings: number): number {
  return amount * servings
}

const plain = (n: number) => String(Math.round(n * 100) / 100)

function formatMl(amount: number): string {
  const step = amount < 30 ? 2.5 : 5
  return `${plain(Math.max(2.5, Math.round(amount / step) * step))} ml`
}

function formatOz(amount: number): string {
  const quarters = Math.max(1, Math.round((amount / ML_PER_OZ) * 4))
  const whole = Math.floor(quarters / 4)
  return `${whole === 0 ? '' : whole}${QUARTERS[quarters % 4]} oz`
}

export function formatMeasure(amount: number, unit: Unit, display: DisplayUnits): string {
  switch (unit) {
    case 'ml':
      return display === 'oz' ? formatOz(amount) : formatMl(amount)
    case 'dash':
      return `${plain(amount)} ${amount === 1 ? 'dash' : 'dashes'}`
    case 'barspoon':
      return `${plain(amount)} ${amount === 1 ? 'barspoon' : 'barspoons'}`
    case 'piece':
      return plain(amount)
  }
}
