import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DrinkCard } from '../components/DrinkCard'
import { useContent } from '../content/ContentContext'
import { INGREDIENT_CATEGORIES, type Ingredient } from '../content/schema'
import { CATEGORY_NAMES } from '../core/labels'
import { matchBar } from '../core/matching'
import { useUserData } from '../storage/UserDataContext'

const byName = (a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name)

export function MyBar() {
  const { content, ingredientById, stapleIds } = useContent()
  const { data, toggleOwned } = useUserData()
  const owned = useMemo(() => new Set(data.ownedIngredientIds), [data.ownedIngredientIds])
  const results = useMemo(() => matchBar(content, owned), [content, owned])
  const hasBottles = data.ownedIngredientIds.some((id) => !stapleIds.includes(id))
  // Two views, so ticking a bottle never pushes the list down the screen under the person's finger.
  const [view, setView] = useState<'bottles' | 'results'>(hasBottles ? 'results' : 'bottles')

  const common = content.ingredients.filter((i) => i.common).sort(byName)
  const groups = INGREDIENT_CATEGORIES.map((category) => ({
    name: CATEGORY_NAMES[category],
    ingredients: content.ingredients.filter((i) => i.category === category && !i.common).sort(byName),
  })).filter((g) => g.ingredients.length > 0)

  const name = (id: string) => ingredientById.get(id)!.name

  const checklist = (legend: string, ingredients: Ingredient[]) => (
    <fieldset key={legend} className="group">
      <legend>{legend}</legend>
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="check">
          <input
            id={`own-${ingredient.id}`}
            type="checkbox"
            checked={owned.has(ingredient.id)}
            onChange={() => toggleOwned(ingredient.id)}
          />
          <label htmlFor={`own-${ingredient.id}`}>{ingredient.name}</label>
          <Link to={`/ingredients/${ingredient.id}`} className="small" aria-label={`About ${ingredient.name}`}>
            About
          </Link>
        </div>
      ))}
    </fieldset>
  )

  return (
    <div className="stack">
      <h1>My bar</h1>
      <div className="row pinned" role="group" aria-label="View">
        <button className="button" aria-pressed={view === 'bottles'} onClick={() => setView('bottles')}>
          My bottles
        </button>
        <button className="button" aria-pressed={view === 'results'} onClick={() => setView('results')}>
          What I can make ({results.makeable.length})
        </button>
      </div>

      {view === 'bottles' ? (
        <section className="stack-sm">
          <p>Tick the bottles you have and we'll show what you can make, and what to buy next.</p>
          {common.length > 0 && checklist('Common bottles', common)}
          {groups.map((g) => checklist(g.name, g.ingredients))}
        </section>
      ) : (
        <>
          <section className="stack-sm">
            <h2 id="can-make-heading">Can make now</h2>
            {results.makeable.length === 0 ? (
              <p className="muted">Nothing yet. Tick a few more ingredients under "My bottles", such as juices and syrups.</p>
            ) : (
              <ul className="card-list" aria-labelledby="can-make-heading">
                {results.makeable.map((drink) => (
                  <li key={drink.id}>
                    <DrinkCard drink={drink} makeable />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {results.oneShort.length > 0 && (
            <section className="section">
              <h2 id="one-short-heading">One ingredient short</h2>
              <ul className="stack-sm plain-list" aria-labelledby="one-short-heading">
                {results.oneShort.map(({ drink, missingId }) => (
                  <li key={drink.id}>
                    <Link to={`/drinks/${drink.id}`}>{drink.name}</Link> needs{' '}
                    <Link to={`/ingredients/${missingId}`}>{name(missingId)}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.nextPurchases.length > 0 && (
            <section className="section">
              <h2 id="next-heading">Best next purchase</h2>
              <ol className="stack-sm steps" aria-labelledby="next-heading">
                {results.nextPurchases.slice(0, 5).map(({ ingredientId, unlocks }) => (
                  <li key={ingredientId}>
                    <Link to={`/ingredients/${ingredientId}`}>{name(ingredientId)}</Link> unlocks {unlocks}{' '}
                    {unlocks === 1 ? 'drink' : 'drinks'}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </div>
  )
}
