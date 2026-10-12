import { Link } from 'react-router-dom'
import { FAMILIES } from '../content/families'
import type { Drink } from '../content/schema'
import { titleCase } from '../core/labels'
import { GlassIcon } from './GlassIcon'

export function DrinkCard({ drink, makeable }: { drink: Drink; makeable: boolean }) {
  return (
    <Link to={`/drinks/${drink.id}`} className="card">
      <GlassIcon glass={drink.glass} />
      <h2 className="card-name">{drink.name}</h2>
      <span className="card-meta">
        <span>{FAMILIES[drink.family].name}</span>
        <span>{titleCase(drink.difficulty)}</span>
        {makeable && <span className="badge good">You can make this</span>}
      </span>
    </Link>
  )
}
