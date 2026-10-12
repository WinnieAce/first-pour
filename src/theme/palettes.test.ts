import { PALETTES, SCHEMES, type Palette } from './palettes'

const channel = (hex: string, at: number) => {
  const c = parseInt(hex.slice(at, at + 2), 16) / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const luminance = (hex: string) => 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// WCAG 2.1 AA: 4.5:1 for text, 3:1 for the edges of fields and buttons.
const pairs: [keyof Palette, keyof Palette, number][] = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['muted', 'bg', 4.5],
  ['muted', 'surface', 4.5],
  ['accent', 'bg', 4.5],
  ['accent', 'surface', 4.5],
  ['onAccent', 'accent', 4.5],
  ['good', 'bg', 4.5],
  ['good', 'surface', 4.5],
  ['warnText', 'warnBg', 4.5],
  ['controlLine', 'bg', 3],
  ['controlLine', 'surface', 3],
]

describe.each(SCHEMES.flatMap((scheme) => (['light', 'dark'] as const).map((mode) => [scheme, mode] as const)))(
  '%s, %s',
  (scheme, mode) => {
    const palette = PALETTES[scheme][mode]
    it.each(pairs)('%s on %s has a contrast of at least %s', (front, back, minimum) => {
      expect(contrast(palette[front], palette[back])).toBeGreaterThanOrEqual(minimum)
    })
    it('has a page background that suits its mode', () => {
      const light = luminance(palette.bg) > 0.5
      expect(light).toBe(mode === 'light')
    })
  },
)
