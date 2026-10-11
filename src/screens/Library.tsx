import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DrinkCard } from '../components/DrinkCard'
import { useContent } from '../content/ContentContext'
import { FAMILIES } from '../content/families'
import { DIFFICULTIES, FAMILY_IDS, FLAVOURS } from '../content/schema'
import { titleCase } from '../core/labels'
import { matchBar } from '../core/matching'
import { filterDrinks, type DrinkFilters } from '../core/search'
import { useUserData } from '../storage/UserDataContext'

const oneOf = <T extends string>(allowed: readonly T[], value: string | null): T | undefined =>
  allowed.find((a) => a === value)

export function Library() {
  const { content, ingredientById } = useContent()
  const { data } = useUserData()
  const [params, setParams] = useSearchParams()

  const baseSpirits = useMemo(
    () =>
      [...new Set(content.drinks.flatMap((d) => (d.baseIngredientId ? [d.baseIngredientId] : [])))]
        .map((id) => ingredientById.get(id)!)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [content, ingredientById],
  )

  // Filters live in the address so the back button returns to the same list.
  const filters: DrinkFilters = {
    query: params.get('q') ?? '',
    baseIngredientId: baseSpirits.find((b) => b.id === params.get('base'))?.id,
    family: oneOf(FAMILY_IDS, params.get('family')),
    flavour: oneOf(FLAVOURS, params.get('flavour')),
    difficulty: oneOf(DIFFICULTIES, params.get('difficulty')),
    makeableOnly: params.get('makeable') === '1',
  }

  const makeableIds = useMemo(
    () => new Set(matchBar(content, new Set(data.ownedIngredientIds)).makeable.map((d) => d.id)),
    [content, data.ownedIngredientIds],
  )
  const drinks = filterDrinks(content, filters, makeableIds)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const select = (label: string, key: string, value: string | undefined, options: { value: string; label: string }[]) => (
    <label className="field">
      {label}
      <select value={value ?? ''} onChange={(e) => setParam(key, e.target.value)}>
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="stack">
      <h1>Drinks</h1>
      <label className="field">
        Search drinks or ingredients
        <input type="search" value={filters.query} onChange={(e) => setParam('q', e.target.value)} />
      </label>
      <div className="filters">
        {select('Base spirit', 'base', filters.baseIngredientId, baseSpirits.map((b) => ({ value: b.id, label: b.name })))}
        {select('Family', 'family', filters.family, FAMILY_IDS.map((f) => ({ value: f, label: FAMILIES[f].name })))}
        {select('Flavour', 'flavour', filters.flavour, FLAVOURS.map((f) => ({ value: f, label: titleCase(f) })))}
        {select('Difficulty', 'difficulty', filters.difficulty, DIFFICULTIES.map((d) => ({ value: d, label: titleCase(d) })))}
      </div>
      <div className="check">
        <input
          id="makeable-only"
          type="checkbox"
          checked={filters.makeableOnly}
          onChange={(e) => setParam('makeable', e.target.checked ? '1' : '')}
        />
        <label htmlFor="makeable-only">Only drinks I can make</label>
      </div>

      <p className="muted small" role="status">
        {drinks.length === 1 ? '1 drink' : `${drinks.length} drinks`}
      </p>
      {drinks.length === 0 && (
        <div className="stack-sm">
          <p>No drinks match. Try a different search or fewer filters.</p>
          <div>
            <button className="button" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </button>
          </div>
        </div>
      )}
      <ul className="card-list" aria-label="Drinks">
        {drinks.map((drink) => (
          <li key={drink.id}>
            <DrinkCard drink={drink} makeable={makeableIds.has(drink.id)} />
          </li>
        ))}
      </ul>
    </div>
  )
}
