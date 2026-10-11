import type { GlassId } from '../content/schema'

const OUTLINES: Record<GlassId, string> = {
  rocks: 'M9 13h22l-2 20H11z M10.5 22h19',
  highball: 'M12 5h16l-1.5 30h-13z M12.8 16h14.4',
  coupe: 'M7 8h26c0 8-6 12-13 12S7 16 7 8z M20 20v13 M13 34h14',
  martini: 'M6 7h28L20 21z M20 21v12 M13 34h14 M11 12h18',
  wine: 'M13 5h14c1 8-1 15-7 15s-8-7-7-15z M20 20v13 M14 34h12 M13 12h14',
  flute: 'M15 4h10c.5 9-1 17-5 17s-5.5-8-5-17z M20 21v12 M15 34h10',
  mug: 'M9 9h18v24H9z M27 14h4a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-4',
}

/** A simple line drawing of the glass a drink is served in. Decorative: the glass is also named in text. */
export function GlassIcon({ glass }: { glass: GlassId }) {
  return (
    <svg className="glass" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path
        d={OUTLINES[glass]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
