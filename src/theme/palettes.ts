export const SCHEMES = ['classic', 'velvet', 'manor', 'harbour', 'library'] as const
export const THEMES = ['system', 'light', 'dark'] as const

export type Scheme = (typeof SCHEMES)[number]
export type Theme = (typeof THEMES)[number]
export type Mode = 'light' | 'dark'

export type Palette = {
  bg: string
  surface: string
  text: string
  muted: string
  line: string
  /** Edges of fields and buttons: 3:1 or better against both backgrounds. */
  controlLine: string
  accent: string
  onAccent: string
  good: string
  warnBg: string
  warnText: string
}

// Contrast for every pairing the app uses is checked in palettes.test.ts. The classic values
// are repeated in styles.css, which is what shows before any setting has loaded.
export const PALETTES: Record<Scheme, { name: string; light: Palette; dark: Palette }> = {
  classic: {
    name: 'Classic',
    light: {
      bg: '#fbf7f1',
      surface: '#ffffff',
      text: '#1f1a17',
      muted: '#62564e',
      line: '#e2d8cc',
      controlLine: '#85776c',
      accent: '#9a3412',
      onAccent: '#ffffff',
      good: '#166534',
      warnBg: '#fef3c7',
      warnText: '#713f12',
    },
    dark: {
      bg: '#171311',
      surface: '#231d19',
      text: '#f3ece6',
      muted: '#b9aca2',
      line: '#3a302a',
      controlLine: '#8f8177',
      accent: '#f6a876',
      onAccent: '#1f1410',
      good: '#86efac',
      warnBg: '#42320c',
      warnText: '#fde68a',
    },
  },
  velvet: {
    name: 'Velvet',
    light: {
      bg: '#f4e9e6',
      surface: '#fffaf8',
      text: '#2a1215',
      muted: '#6b4a4c',
      line: '#dcc5c0',
      controlLine: '#8a6a6a',
      accent: '#733438',
      onAccent: '#ffffff',
      good: '#1f5c33',
      warnBg: '#f3ddb8',
      warnText: '#5e3a0a',
    },
    dark: {
      bg: '#1a0d0e',
      surface: '#2a1517',
      text: '#f0e2de',
      muted: '#c9a9a4',
      line: '#45272a',
      controlLine: '#9a7773',
      accent: '#e0a09c',
      onAccent: '#1a0d0e',
      good: '#9fd8a5',
      warnBg: '#45171b',
      warnText: '#f3cfc0',
    },
  },
  manor: {
    name: 'Manor',
    light: {
      bg: '#f6ebdb',
      surface: '#fff9f0',
      text: '#2b1510',
      muted: '#6a4a3a',
      line: '#e0cdb2',
      controlLine: '#8c6f56',
      accent: '#85431e',
      onAccent: '#ffffff',
      good: '#2c5a2e',
      warnBg: '#f5dfa8',
      warnText: '#5a3a08',
    },
    dark: {
      bg: '#180c0c',
      surface: '#2a1712',
      text: '#f3e3cb',
      muted: '#c9ae8f',
      line: '#4a2d22',
      controlLine: '#9c7b5f',
      accent: '#eaceaa',
      onAccent: '#2a1206',
      good: '#a7d7a0',
      warnBg: '#4a2a10',
      warnText: '#f6d9a6',
    },
  },
  harbour: {
    name: 'Harbour',
    light: {
      bg: '#f3efe8',
      surface: '#ffffff',
      text: '#1b2437',
      muted: '#4e5b70',
      line: '#d5d2cb',
      controlLine: '#76839a',
      accent: '#25344f',
      onAccent: '#ffffff',
      good: '#1f5e3b',
      warnBg: '#f2e0c0',
      warnText: '#5c3a12',
    },
    dark: {
      bg: '#141c2b',
      surface: '#1f2a3f',
      text: '#e8e3d8',
      muted: '#a9b4c4',
      line: '#33405a',
      controlLine: '#7c8aa3',
      accent: '#d5b893',
      onAccent: '#1b2233',
      good: '#9ad6b0',
      warnBg: '#4a2a20',
      warnText: '#f2d3b0',
    },
  },
  library: {
    name: 'Library',
    light: {
      bg: '#f5efe2',
      surface: '#fffcf6',
      text: '#2a2618',
      muted: '#5e5a45',
      line: '#ddd5c0',
      controlLine: '#857f66',
      accent: '#6e3f4a',
      onAccent: '#ffffff',
      good: '#3b5a2a',
      warnBg: '#f1dfb4',
      warnText: '#5a3c10',
    },
    dark: {
      bg: '#1e1f17',
      surface: '#2b2c20',
      text: '#f1ebdd',
      muted: '#b8b39e',
      line: '#3f3e2e',
      controlLine: '#8d8a72',
      accent: '#d8a9b4',
      onAccent: '#2a1620',
      good: '#a9d6a0',
      warnBg: '#443223',
      warnText: '#efd3a8',
    },
  },
}
