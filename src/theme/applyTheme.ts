import { PALETTES, SCHEMES, THEMES, type Mode, type Palette, type Scheme, type Theme } from './palettes'

const CSS_NAMES: Record<keyof Palette, string> = {
  bg: '--bg',
  surface: '--surface',
  text: '--text',
  muted: '--muted',
  line: '--line',
  controlLine: '--control-line',
  accent: '--accent',
  onAccent: '--on-accent',
  good: '--good',
  warnBg: '--warn-bg',
  warnText: '--warn-text',
}

// A copy of the choice kept where it can be read instantly, so the page does not flash the
// default colours while the saved data loads.
const CACHE_KEY = 'first-pour-appearance'

const deviceIsDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

export function resolveMode(theme: Theme): Mode {
  if (theme === 'system') return deviceIsDark() ? 'dark' : 'light'
  return theme
}

function paintPage(theme: Theme, scheme: Scheme): void {
  const root = document.documentElement
  const mode = resolveMode(theme)
  const palette = PALETTES[scheme][mode]
  for (const key of Object.keys(CSS_NAMES) as (keyof Palette)[]) root.style.setProperty(CSS_NAMES[key], palette[key])
  root.style.colorScheme = mode
  root.dataset.theme = mode
  root.dataset.scheme = scheme
}

/** Recolours the page. Returns a function that stops following the device's light or dark setting. */
export function applyTheme(theme: Theme, scheme: Scheme): () => void {
  const paint = () => paintPage(theme, scheme)
  paint()
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ theme, scheme }))
  } catch {
    // Without the copy the page still works; it only shows the default colours for a moment on opening.
  }

  if (theme !== 'system' || !window.matchMedia) return () => {}
  const device = window.matchMedia('(prefers-color-scheme: dark)')
  device.addEventListener('change', paint)
  return () => device.removeEventListener('change', paint)
}

/** Applies the last choice made on this device, before the saved data has loaded. */
export function applyCachedTheme(): void {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null')
    const theme = THEMES.find((t) => t === cached?.theme)
    const scheme = SCHEMES.find((s) => s === cached?.scheme)
    if (theme && scheme) paintPage(theme, scheme)
  } catch {
    // Nothing cached, or storage is unavailable: the stylesheet's colours apply.
  }
}
