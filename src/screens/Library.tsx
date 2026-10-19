import { useMemo, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DrinkCard } from '../components/DrinkCard'
import { GlassIcon } from '../components/GlassIcon'
import { GlassLink } from '../components/GlassLink'
import { useContent } from '../content/ContentContext'
import { FAMILIES } from '../content/families'
import { COLLECTIONS, DIFFICULTIES, FAMILY_IDS, FLAVOURS, type Drink } from '../content/schema'
import { glassExtras } from '../core/extras'
import { greeting, titleCase } from '../core/labels'
import { shelfMotion } from '../hooks/shelfMotion'
import { matchBar } from '../core/matching'
import { filterDrinks, type DrinkFilters } from '../core/search'
import { useUserData } from '../storage/UserDataContext'

const oneOf = <T extends string>(allowed: readonly T[], value: string | null): T | undefined =>
  allowed.find((a) => a === value)

export function Library() {
  const { content, ingredientById, stapleIds } = useContent()
  const { data } = useUserData()
  const [params, setParams] = useSearchParams()
  // The text box keeps its own value: the address updates a moment later, and driving a text
  // input from it can move the caret or drop characters while typing.
  const [query, setQuery] = useState(params.get('q') ?? '')

  const baseSpirits = useMemo(
    () =>
      [...new Set(content.drinks.flatMap((d) => (d.baseIngredientId ? [d.baseIngredientId] : [])))]
        .map((id) => ingredientById.get(id)!)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [content, ingredientById],
  )

  // Filters live in the address so the back button returns to the same list.
  const filters: DrinkFilters = {
    query,
    baseIngredientId: baseSpirits.find((b) => b.id === params.get('base'))?.id,
    family: oneOf(FAMILY_IDS, params.get('family')),
    flavour: oneOf(FLAVOURS, params.get('flavour')),
    difficulty: oneOf(DIFFICULTIES, params.get('difficulty')),
    collection: oneOf(COLLECTIONS, params.get('collection')),
    alcoholFree: params.get('zero') === '1',
    makeableOnly: params.get('makeable') === '1',
  }

  const filtersInUse = [filters.baseIngredientId, filters.family, filters.flavour, filters.difficulty].filter(Boolean).length
  // Closed to begin with so the drinks start higher up, unless the address arrives with a filter set.
  const [filtersOpen, setFiltersOpen] = useState(filtersInUse > 0)
  const hasBottles = data.ownedIngredientIds.some((id) => !stapleIds.includes(id))

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

  // Read once, when the screen opens, so the greeting cannot change in the middle of a visit.
  const [hello] = useState(() => greeting(new Date().getHours()))
  const quickFilters = filters.makeableOnly || filters.collection !== undefined || filters.alcoholFree === true
  const browsing = query.trim() === '' && !quickFilters && filtersInUse === 0

  // The shelf leads with the person's favourites, those they can make first, then the other drinks
  // they can make. The rest is filled with one easy drink from each family as a place to start.
  const byName = (a: Drink, b: Drink) => a.name.localeCompare(b.name)
  const canMake = content.drinks.filter((d) => makeableIds.has(d.id)).sort(byName)
  const favourites = content.drinks.filter((d) => data.favouriteDrinkIds.includes(d.id)).sort(byName)
  const personal = [
    ...favourites.filter((d) => makeableIds.has(d.id)),
    ...favourites.filter((d) => !makeableIds.has(d.id)),
    ...canMake.filter((d) => !data.favouriteDrinkIds.includes(d.id)),
  ]
  const starters = FAMILY_IDS.flatMap((f) => content.drinks.filter((d) => d.family === f && d.difficulty === 'easy').slice(0, 1))
  const shelf = {
    title: personal.length > 0 ? "Tonight's shelf" : 'Good first drinks',
    drinks: [...personal, ...starters.filter((d) => !personal.includes(d))].slice(0, 8),
  }
  const tileNote = (drink: Drink) => {
    const favourite = data.favouriteDrinkIds.includes(drink.id)
    const makeable = makeableIds.has(drink.id)
    if (favourite) return makeable ? 'Favourite · can make' : 'Favourite'
    return makeable ? 'You can make this' : FAMILIES[drink.family].name
  }

  const clearQuickFilters = () => {
    const next = new URLSearchParams(params)
    for (const key of ['makeable', 'collection', 'zero']) next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="stack">
      <header>
        <h1 className="visually-hidden">Drinks</h1>
        <p className="hello">{hello}</p>
        <p className="muted">
          <span role="status">{drinks.length === 1 ? '1 drink' : `${drinks.length} drinks`}.</span>{' '}
          {canMake.length > 0 && <strong className="accent">{canMake.length} you can make now.</strong>}
        </p>
      </header>
      {!hasBottles && (
        <p className="callout">
          Tick the bottles you own and we'll show what you can make. <Link to="/bar">Set up my bar</Link>
        </p>
      )}
      <label className="field search">
        Search drinks or ingredients
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setParam('q', e.target.value)
          }}
        />
      </label>
      <div className="chips" role="group" aria-label="Show">
        <button className="chip" aria-pressed={!quickFilters} onClick={clearQuickFilters}>
          All
        </button>
        <button
          className="chip"
          aria-pressed={filters.makeableOnly}
          onClick={() => setParam('makeable', filters.makeableOnly ? '' : '1')}
        >
          Can make
        </button>
        <button
          className="chip"
          aria-pressed={filters.collection === 'singapore'}
          onClick={() => setParam('collection', filters.collection === 'singapore' ? '' : 'singapore')}
        >
          Singapore
        </button>
        <button
          className="chip"
          aria-pressed={filters.alcoholFree === true}
          onClick={() => setParam('zero', filters.alcoholFree ? '' : '1')}
        >
          No alcohol
        </button>
        <button className="chip" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>
          {filtersInUse > 0 ? `Filters (${filtersInUse})` : 'Filters'}
        </button>
      </div>
      {filtersOpen && (
        <div className="filters">
          {select('Base spirit', 'base', filters.baseIngredientId, baseSpirits.map((b) => ({ value: b.id, label: b.name })))}
          {select('Family', 'family', filters.family, FAMILY_IDS.map((f) => ({ value: f, label: FAMILIES[f].name })))}
          {select('Flavour', 'flavour', filters.flavour, FLAVOURS.map((f) => ({ value: f, label: titleCase(f) })))}
          {select('Difficulty', 'difficulty', filters.difficulty, DIFFICULTIES.map((d) => ({ value: d, label: titleCase(d) })))}
        </div>
      )}

      {browsing && shelf.drinks.length > 0 && (
        <section className="stack-sm">
          <h2 className="label" id="shelf-heading">
            {shelf.title}
          </h2>
          <ul className="shelf" aria-labelledby="shelf-heading" ref={shelfMotion}>
            {shelf.drinks.map((drink, n) => (
              // --order staggers the tiles' entrance; --phase starts each glass's loops at a different point.
              <li key={drink.id} style={{ '--order': n, '--phase': `${-n * 0.37}s` } as CSSProperties}>
                <GlassLink to={`/drinks/${drink.id}`} className="arch" style={{ '--tint': drink.colour } as CSSProperties}>
                  <GlassIcon glass={drink.glass} colour={drink.colour} extras={glassExtras(drink)} id={`shelf:${drink.id}`} />
                  <span className="arch-name">{drink.name}</span>
                  <small>{tileNote(drink)}</small>
                </GlassLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {drinks.length === 0 && (
        <div className="stack-sm">
          <p>No drinks match. Try a different search or fewer filters.</p>
          <div>
            <button
              className="button"
              onClick={() => {
                setQuery('')
                setParams({}, { replace: true })
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
      <section className="stack-sm">
        {browsing && <h2 className="label">The menu</h2>}
        <ul className="card-list" aria-label="Drinks">
          {drinks.map((drink) => (
            <li key={drink.id}>
              <DrinkCard drink={drink} makeable={makeableIds.has(drink.id)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
