import { useId } from 'react'
import type { GlassId } from '../content/schema'

// `bowl` is the part that holds the drink, `rest` the stem, base or handle, and `surface` how far
// down the bowl the top of the liquid sits.
const GLASSES: Record<GlassId, { bowl: string; rest?: string; surface: number }> = {
  rocks: { bowl: 'M9 13h22l-2 20H11z', surface: 21 },
  highball: { bowl: 'M12 5h16l-1.5 30h-13z', surface: 13 },
  coupe: { bowl: 'M7 8h26c0 8-6 12-13 12S7 16 7 8z', rest: 'M20 20v13 M13 34h14', surface: 11 },
  martini: { bowl: 'M6 7h28L20 21z', rest: 'M20 21v12 M13 34h14', surface: 11 },
  wine: { bowl: 'M13 5h14c1 8-1 15-7 15s-8-7-7-15z', rest: 'M20 20v13 M14 34h12', surface: 11 },
  flute: { bowl: 'M15 4h10c.5 9-1 17-5 17s-5.5-8-5-17z', rest: 'M20 21v12 M15 34h10', surface: 9 },
  mug: { bowl: 'M9 9h18v24H9z', rest: 'M27 14h4a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-4', surface: 14 },
}

/**
 * A line drawing of the glass a drink is served in, filled with the colour of the drink.
 * Decorative: the glass is also named in text.
 */
export function GlassIcon({ glass, colour }: { glass: GlassId; colour: string }) {
  const clip = useId()
  const { bowl, rest, surface } = GLASSES[glass]
  return (
    <svg
      className="glass"
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <clipPath id={clip}>
        <path d={bowl} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect className="liquid" x="0" y={surface} width="40" height="40" fill={colour} stroke="none" />
      </g>
      <path d={bowl} />
      {rest && <path d={rest} />}
    </svg>
  )
}
