import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DrinkCard } from '../components/DrinkCard'
import { GlassIcon } from '../components/GlassIcon'
import { useContent } from '../content/ContentContext'
import { matchBar } from '../core/matching'
import { useUserData } from '../storage/UserDataContext'

export function Favourites() {
  const { content } = useContent()
  const { data } = useUserData()
  const makeableIds = useMemo(
    () => new Set(matchBar(content, new Set(data.ownedIngredientIds)).makeable.map((d) => d.id)),
    [content, data.ownedIngredientIds],
  )
  const favourites = content.drinks
    .filter((d) => data.favouriteDrinkIds.includes(d.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="stack">
      <h1 id="favourites-heading">Favourites</h1>
      {favourites.length === 0 ? (
        <div className="empty">
          <GlassIcon glass="coupe" colour="transparent" />
          <p>
            No favourites yet. Open a drink and choose "Add to favourites" to keep it here, and it will also lead
            the shelf on the drinks screen.
          </p>
          <Link to="/" className="button primary">
            Browse the drinks
          </Link>
        </div>
      ) : (
        <ul className="card-list" aria-labelledby="favourites-heading">
          {favourites.map((drink) => (
            <li key={drink.id}>
              <DrinkCard drink={drink} makeable={makeableIds.has(drink.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
