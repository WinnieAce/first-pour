import { Link, useParams } from 'react-router-dom'
import { GlassIcon } from '../components/GlassIcon'
import { Measure } from '../components/Measure'
import { ResponsibleNotice } from '../components/ResponsibleNotice'
import { useContent } from '../content/ContentContext'
import { FAMILIES } from '../content/families'
import type { DrinkIngredient, Ingredient } from '../content/schema'
import { drinkAllergens } from '../core/allergens'
import { GLASS_NAMES, titleCase } from '../core/labels'
import { calculateStrength, containsAlcohol } from '../core/strength'
import { useUserData } from '../storage/UserDataContext'
import { NotFound } from './NotFound'

function Availability({ ingredient, owned }: { ingredient: Ingredient; owned: ReadonlySet<string> }) {
  const { ingredientById } = useContent()
  if (owned.has(ingredient.id)) return <span className="badge good">In your bar</span>
  const substitute = ingredient.substitutes.find((s) => owned.has(s))
  if (substitute) return <span className="badge good">Use your {ingredientById.get(substitute)!.name}</span>
  return <span className="badge">Not in your bar</span>
}

export function DrinkPage() {
  const { id } = useParams()
  const { content, drinkById, ingredientById } = useContent()
  const { data, toggleFavourite } = useUserData()
  const drink = drinkById.get(id ?? '')
  if (!drink) return <NotFound what="drink" />

  const owned = new Set(data.ownedIngredientIds)
  const family = FAMILIES[drink.family]
  const relatives = content.drinks
    .filter((d) => d.family === drink.family && d.id !== drink.id)
    .sort((a, b) => a.name.localeCompare(b.name))
  const strength = calculateStrength(drink, ingredientById)
  const alcoholic = containsAlcohol(drink, ingredientById)
  const allergens = drinkAllergens(drink, ingredientById)
  const isFavourite = data.favouriteDrinkIds.includes(drink.id)

  const ingredientRow = (item: DrinkIngredient) => {
    const ingredient = ingredientById.get(item.ingredientId)!
    const substitutes = ingredient.substitutes.map((s) => ingredientById.get(s)!.name)
    return (
      <li key={item.ingredientId}>
        <Measure amount={item.amount} unit={item.unit} />
        <div className="stack-sm">
          <div className="row">
            <Link to={`/ingredients/${ingredient.id}`}>{ingredient.name}</Link>
            {item.optional && <span className="muted small">Optional</span>}
            <Availability ingredient={ingredient} owned={owned} />
          </div>
          {item.note && <span className="muted small">{item.note}</span>}
          {substitutes.length > 0 && <span className="muted small">or {substitutes.join(', ')}</span>}
        </div>
      </li>
    )
  }

  return (
    <article className="stack">
      <header className="row">
        <GlassIcon glass={drink.glass} />
        <h1>{drink.name}</h1>
      </header>
      <div className="row">
        <span className="badge">{titleCase(drink.difficulty)}</span>
        {drink.flavour.map((f) => (
          <span key={f} className="badge">
            {titleCase(f)}
          </span>
        ))}
        {!alcoholic && <span className="badge good">No alcohol</span>}
      </div>
      <div className="row">
        <Link to={`/drinks/${drink.id}/make`} className="button primary">
          Start making
        </Link>
        <button className="button" aria-pressed={isFavourite} onClick={() => toggleFavourite(drink.id)}>
          {isFavourite ? '★ In your favourites' : '☆ Add to favourites'}
        </button>
      </div>

      <section className="section">
        <h2>Why this works</h2>
        <p>{drink.whyItWorks}</p>
      </section>

      <section className="section">
        <h2>Ingredients</h2>
        <ul className="ingredient-rows" aria-label="Ingredients">
          {drink.ingredients.map(ingredientRow)}
        </ul>
        {allergens.length > 0 && <p className="badge warn">Contains: {allergens.join(', ')}</p>}
      </section>

      <section className="section">
        <h2>How to make it</h2>
        <p>
          <strong>Glass:</strong> {GLASS_NAMES[drink.glass]}
        </p>
        {drink.tools.length > 0 && (
          <>
            <h3 id="tools-heading">Tools</h3>
            <ul aria-labelledby="tools-heading">
              {drink.tools.map((tool) => (
                <li key={tool.name}>
                  {tool.name} <span className="muted">(or: {tool.alternative})</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <ol className="steps" aria-label="Steps">
          {drink.steps.map((step, n) => (
            <li key={n}>{step.text}</li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>Strength</h2>
        <dl className="stats">
          <div>
            <dt>Alcohol by volume</dt>
            <dd>{alcoholic && strength.abvPercent === 0 ? 'Under 1%' : `${strength.abvPercent}%`}</dd>
          </div>
          <div>
            <dt>Pure alcohol</dt>
            <dd>{strength.alcoholGrams} g</dd>
          </div>
          <div>
            <dt>Standard drinks</dt>
            <dd>{strength.standardDrinks}</dd>
          </div>
        </dl>
        <p className="muted small">
          These figures are approximate and assume the ingredients as listed, so a swap can change them. A standard drink
          here is 10 g of alcohol; the definition varies by country.
        </p>
        <ResponsibleNotice />
      </section>

      <section className="section">
        <h2>{family.name}</h2>
        <p>{family.description}</p>
        {relatives.length > 0 && (
          <>
            <p className="muted small">Others in this family:</p>
            <ul className="row plain-list">
              {relatives.map((d) => (
                <li key={d.id}>
                  <Link to={`/drinks/${d.id}`}>{d.name}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </article>
  )
}
