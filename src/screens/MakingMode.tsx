import { Icon } from '../components/Icon'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Measure } from '../components/Measure'
import { useContent } from '../content/ContentContext'
import type { DrinkIngredient, Technique } from '../content/schema'
import { GLASS_NAMES } from '../core/labels'
import { clampServings, MAX_SERVINGS, MIN_SERVINGS } from '../core/measures'
import { useWakeLock } from '../hooks/useWakeLock'
import { useUserData } from '../storage/UserDataContext'
import { NotFound } from './NotFound'

const TECHNIQUES: Record<Technique, { what: string; why: string; noTool: string }> = {
  shake: {
    what: 'Seal the shaker and shake hard until the outside feels very cold, about 12 to 15 seconds.',
    why: 'Shaking chills fast, adds a little water and mixes in air, which drinks with juice need.',
    noTool: 'No shaker? A jam jar with a tight lid works.',
  },
  stir: {
    what: 'Stir smoothly with plenty of ice for 20 to 30 seconds.',
    why: 'Stirring chills and dilutes without adding air, so drinks made only of spirits stay clear and silky.',
    noTool: 'No bar spoon? Use the handle of a teaspoon or a chopstick.',
  },
  muddle: {
    what: 'Press and twist gently a few times to release the juice and aroma.',
    why: 'Gentle pressure brings out flavour. Crushing herbs hard makes them bitter.',
    noTool: 'No muddler? Use the end of a wooden spoon.',
  },
  strain: {
    what: 'Pour through a strainer so the ice and any bits stay behind.',
    why: 'The ice you mixed with is broken and watery. Leaving it out stops the drink thinning too fast.',
    noTool: 'No strainer? Use a small sieve, or hold the jar lid slightly open.',
  },
  build: {
    what: 'Add the ingredients straight into the serving glass over ice, then give one gentle stir.',
    why: 'Fizzy drinks lose their bubbles if they are shaken or stirred hard.',
    noTool: 'No special tools needed.',
  },
}

export function MakingMode() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { drinkById, ingredientById } = useContent()
  const { data, setUnits } = useUserData()
  const [servings, setServings] = useState(MIN_SERVINGS)
  // Screen 0 is "gather everything"; screens 1..n are the steps.
  const [screen, setScreen] = useState(0)
  const drink = drinkById.get(id ?? '')
  useWakeLock(drink !== undefined)

  if (!drink) {
    return (
      <main className="making">
        <NotFound what="drink" />
      </main>
    )
  }

  const step = screen === 0 ? null : drink.steps[screen - 1]
  const isLast = screen === drink.steps.length
  const technique = step?.technique ? TECHNIQUES[step.technique] : null
  const shown: DrinkIngredient[] = step
    ? drink.ingredients.filter((i) => step.ingredientIds.includes(i.ingredientId))
    : drink.ingredients

  const forward = () => (isLast ? navigate(`/drinks/${drink.id}`) : setScreen(screen + 1))

  return (
    <main className="making">
      <header className="making-top">
        <Link to={`/drinks/${drink.id}`} className="back">
          <Icon name="back" />
          Back to {drink.name}
        </Link>
        <h1>{drink.name}</h1>
        <div className="row">
          <div className="stepper">
            <button
              className="button"
              aria-label="Fewer servings"
              disabled={servings <= MIN_SERVINGS}
              onClick={() => setServings(clampServings(servings - 1))}
            >
              −
            </button>
            <output aria-live="polite">{servings === 1 ? '1 serving' : `${servings} servings`}</output>
            <button
              className="button"
              aria-label="More servings"
              disabled={servings >= MAX_SERVINGS}
              onClick={() => setServings(clampServings(servings + 1))}
            >
              +
            </button>
          </div>
          <div className="stepper" role="group" aria-label="Units">
            {(['ml', 'oz'] as const).map((units) => (
              <button
                key={units}
                className="button"
                aria-pressed={data.settings.units === units}
                onClick={() => setUnits(units)}
              >
                {units}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="making-body" aria-live="polite">
        {step ? (
          <>
            <p className="muted small">
              Step {screen} of {drink.steps.length}
            </p>
            <p className="making-step">{step.text}</p>
          </>
        ) : (
          <>
            <h2>Gather everything</h2>
            <p>
              <strong>Glass:</strong> {GLASS_NAMES[drink.glass]}
            </p>
          </>
        )}

        {shown.length > 0 && (
          <ul className="ingredient-rows" aria-label="Ingredients">
            {shown.map((item) => (
              <li key={item.ingredientId}>
                <Measure amount={item.amount} unit={item.unit} servings={servings} />
                <span>
                  {ingredientById.get(item.ingredientId)!.name}
                  {item.optional && ' (optional)'}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!step && drink.tools.length > 0 && (
          <div>
            <h3 id="making-tools">Tools</h3>
            <ul aria-labelledby="making-tools">
              {drink.tools.map((tool) => (
                <li key={tool.name}>
                  {tool.name} <span className="muted">(or: {tool.alternative})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {technique && (
          <aside className="technique" role="note">
            <p>{technique.what}</p>
            <p className="muted">Why: {technique.why}</p>
            <p className="muted">{technique.noTool}</p>
          </aside>
        )}
      </section>

      <div className="making-actions">
        <button className="button" disabled={screen === 0} onClick={() => setScreen(screen - 1)}>
          Back
        </button>
        <button className="button primary" onClick={forward}>
          {screen === 0 ? 'Start' : isLast ? 'Done' : 'Next'}
        </button>
      </div>
    </main>
  )
}
