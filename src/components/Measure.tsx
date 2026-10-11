import type { Unit } from '../content/schema'
import { formatMeasure, scaleAmount } from '../core/measures'
import { useUserData } from '../storage/UserDataContext'

/** An amount in the person's chosen units, scaled to the number of servings. */
export function Measure({ amount, unit, servings = 1 }: { amount: number; unit: Unit; servings?: number }) {
  const { data } = useUserData()
  return <span className="measure">{formatMeasure(scaleAmount(amount, servings), unit, data.settings.units)}</span>
}
