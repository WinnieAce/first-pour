import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DrinkCard } from '../components/DrinkCard'
import { useContent } from '../content/ContentContext'
import { CATEGORY_NAMES } from '../core/labels'
import { matchBar } from '../core/matching'
import { useUserData } from '../storage/UserDataContext'
import { NotFound } from './NotFound'

export function IngredientPage() {
  const { id } = useParams()
  const { content, ingredientById } = useContent()
  const { data, toggleOwned } = useUserData()
  const makeableIds = useMemo(
    () => new Set(matchBar(content, new Set(data.ownedIngredientIds)).makeable.map((d) => d.id)),
    [content, data.ownedIngredientIds],
  )

  const ingredient = ingredientById.get(id ?? '')
  if (!ingredient) return <NotFound what="ingredient" />

  const owned = data.ownedIngredientIds.includes(ingredient.id)
  const usedIn = content.drinks
    .filter((d) => d.ingredients.some((i) => i.ingredientId === ingredient.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <article className="stack">
      <header className="stack-sm">
        <h1>{ingredient.name}</h1>
        <p className="muted small">
          {CATEGORY_NAMES[ingredient.category]} · {ingredient.abv > 0 ? `${ingredient.abv}% alcohol` : 'No alcohol'}
        </p>
      </header>
      <p>{ingredient.description}</p>
      <div>
        <button className="button" aria-pressed={owned} onClick={() => toggleOwned(ingredient.id)}>
          {owned ? '✓ In my bar' : '+ Add to my bar'}
        </button>
      </div>
      {ingredient.allergens.length > 0 && <p className="badge warn">Contains: {ingredient.allergens.join(', ')}</p>}

      {ingredient.pairsWith.length > 0 && (
        <section className="section">
          <h2 id="pairs-heading">Goes well with</h2>
          <ul className="stack-sm plain-list" aria-labelledby="pairs-heading">
            {ingredient.pairsWith.map((pair) => (
              <li key={pair.ingredientId}>
                <Link to={`/ingredients/${pair.ingredientId}`}>{ingredientById.get(pair.ingredientId)!.name}</Link>
                <br />
                <span className="muted">{pair.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ingredient.substitutes.length > 0 && (
        <section className="section">
          <h2 id="swaps-heading">You can swap it for</h2>
          <ul className="row plain-list" aria-labelledby="swaps-heading">
            {ingredient.substitutes.map((s) => (
              <li key={s}>
                <Link to={`/ingredients/${s}`}>{ingredientById.get(s)!.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 id="used-heading">Drinks that use it</h2>
        {usedIn.length === 0 ? (
          <p className="muted">No drinks in the library use this yet.</p>
        ) : (
          <ul className="card-list" aria-labelledby="used-heading">
            {usedIn.map((drink) => (
              <li key={drink.id}>
                <DrinkCard drink={drink} makeable={makeableIds.has(drink.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}
