import { useId } from 'react'
import type { GlassId } from '../content/schema'
import type { GlassExtras } from '../core/extras'

// `bowl` is the part that holds the drink, `rest` the stem, base or handle, and `surface` how far
// down the bowl the top of the liquid sits. `left`, `right`, `rim` and `floor` are the edges of the
// bowl, for placing ice, a straw and a garnish.
type Shape = { bowl: string; rest?: string; surface: number; left: number; right: number; rim: number; floor: number }

const GLASSES: Record<GlassId, Shape> = {
  rocks: { bowl: 'M9 13h22l-2 20H11z', surface: 21, left: 9, right: 31, rim: 13, floor: 33 },
  highball: { bowl: 'M12 5h16l-1.5 30h-13z', surface: 13, left: 12, right: 28, rim: 5, floor: 35 },
  coupe: { bowl: 'M7 8h26c0 8-6 12-13 12S7 16 7 8z', rest: 'M20 20v13 M13 34h14', surface: 11, left: 7, right: 33, rim: 8, floor: 20 },
  martini: { bowl: 'M6 7h28L20 21z', rest: 'M20 21v12 M13 34h14', surface: 11, left: 6, right: 34, rim: 7, floor: 21 },
  wine: { bowl: 'M13 5h14c1 8-1 15-7 15s-8-7-7-15z', rest: 'M20 20v13 M14 34h12', surface: 11, left: 13, right: 27, rim: 5, floor: 20 },
  flute: { bowl: 'M15 4h10c.5 9-1 17-5 17s-5.5-8-5-17z', rest: 'M20 21v12 M15 34h10', surface: 9, left: 15, right: 25, rim: 4, floor: 21 },
  mug: { bowl: 'M9 9h18v24H9z', rest: 'M27 14h4a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-4', surface: 14, left: 9, right: 27, rim: 9, floor: 33 },
}

const CITRUS = { orange: '#f39a2b', lime: '#a9cf52', lemon: '#f2df5a' }

/** The top of the drink as a row of ripples, wider than any glass so it can slide from side to side. */
const wave = (y: number) => `M-20 ${y}${'q2.5 -1.4 5 0q2.5 1.4 5 0'.repeat(8)}V40H-20z`

/**
 * A line drawing of the glass a drink is served in, filled with the colour of the drink.
 * With `extras` the drink comes to life: its surface ripples, and ice, bubbles, a straw, a citrus
 * wheel or steam are added as the recipe calls for. Decorative: the glass is also named in text.
 */
export function GlassIcon({
  glass,
  colour,
  extras,
  id,
}: {
  glass: GlassId
  colour: string
  extras?: GlassExtras
  /** Where this glass sits and which drink it is, such as `shelf:negroni`, for the glide to the drink page. */
  id?: string
}) {
  const clip = useId()
  const { bowl, rest, surface, left, right, rim, floor } = GLASSES[glass]
  const middle = (left + right) / 2
  return (
    <svg
      className="glass"
      data-glass={id}
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
      <g clipPath={`url(#${clip})`} stroke="none">
        {extras ? (
          <g className="liquid" fill={colour}>
            <path className="wave" d={wave(surface - 0.6)} opacity="0.55" />
            <path className="wave" d={wave(surface)} />
          </g>
        ) : (
          // Wider than the glass, so the drink still reaches both sides when the glass tips.
          <rect className="liquid" x="-20" y={surface} width="80" height="40" fill={colour} />
        )}
        {extras?.bubbles &&
          [-3, 0.5, 3.5].map((offset, n) => (
            <circle key={n} className="bubble" cx={middle + offset} cy={floor - 2} r="0.8" fill="#ffffff" />
          ))}
        {extras?.ice && (
          <g fill="#ffffff" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.45">
            <rect className="ice" x={middle - 6} y={surface - 0.5} width="5.5" height="5.5" rx="1.2" />
            <rect className="ice" x={middle + 0.5} y={surface + 1.5} width="5.5" height="5.5" rx="1.2" />
          </g>
        )}
      </g>
      <path d={bowl} />
      {rest && <path d={rest} />}
      {extras?.straw && <path className="straw" d={`M${middle - 1.5} ${floor - 3}L${right + 0.5} ${rim - 7}l4.5 -1.5`} />}
      {extras?.citrus && (
        <g className="wheel" transform={`translate(${left + 1.5} ${rim + 0.5})`}>
          <circle r="4.2" fill={CITRUS[extras.citrus]} strokeWidth="1.2" />
          <path d="M-3 0h6M-1.5 -2.6l3 5.2M1.5 -2.6l-3 5.2" strokeWidth="0.5" strokeOpacity="0.55" />
        </g>
      )}
      {extras?.steam &&
        [-3, 3].map((offset) => (
          <path
            key={offset}
            className="steam"
            d={`M${middle + offset} ${rim - 2}q-2 -2 0 -4q2 -2 0 -4`}
            strokeWidth="1"
            strokeOpacity="0.6"
          />
        ))}
    </svg>
  )
}
