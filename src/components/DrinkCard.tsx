import { Link } from 'react-router-dom'
import { useContent } from '../content/ContentContext'
import { FAMILIES } from '../content/families'
import type { Drink } from '../content/schema'
import { titleCase } from '../core/labels'
import { calculateStrength, containsAlcohol } from '../core/strength'
import { GlassIcon } from './GlassIcon'

/** One line of the menu: the glass, the name, a dotted leader and the strength. */
export function DrinkCard({ drink, makeable }: { drink: Drink; makeable: boolean }) {
  const { ingredientById } = useContent()
  const { abvPercent } = calculateStrength(drink, ingredientById)
  const strength = !containsAlcohol(drink, ingredientById) ? 'No alcohol' : abvPercent === 0 ? 'Under 1%' : `${abvPercent}%`
  return (
    <Link to={`/drinks/${drink.id}`} className="card">
      <GlassIcon glass={drink.glass} colour={drink.colour} />
      <span className="leader">
        <h2 className="card-name">{drink.name}</h2>
        <span className="strength">{strength}</span>
      </span>
      <span className="card-meta">
        <span>{FAMILIES[drink.family].name}</span>
        <span>{titleCase(drink.difficulty)}</span>
        {makeable && <span className="badge good">You can make this</span>}
      </span>
    </Link>
  )
}
