import { z } from 'zod'
import type { Content } from '../content/schema'
import { SCHEMES, THEMES } from '../theme/palettes'

export const CURRENT_VERSION = 1

const userDataSchema = z.object({
  version: z.literal(CURRENT_VERSION),
  ownedIngredientIds: z.array(z.string()),
  favouriteDrinkIds: z.array(z.string()),
  settings: z.object({
    units: z.enum(['ml', 'oz']),
    ageConfirmed: z.boolean(),
    // Added after launch, so data saved earlier has neither and takes the defaults.
    theme: z.enum(THEMES).default('system'),
    scheme: z.enum(SCHEMES).default('classic'),
  }),
})

export type UserData = z.infer<typeof userDataSchema>
export type ParseResult = { ok: true; data: UserData } | { ok: false; reason: 'invalid' | 'newer-version' }

type Versioned = { version: number }

/** Upgrades saved data one version at a time. Keyed by the version being upgraded from. */
const migrations: Record<number, (old: Versioned) => Versioned> = {}

const unique = (ids: string[]) => [...new Set(ids)]

export function defaultUserData(stapleIds: string[]): UserData {
  return {
    version: CURRENT_VERSION,
    ownedIngredientIds: [...stapleIds],
    favouriteDrinkIds: [],
    settings: { units: 'ml', ageConfirmed: false, theme: 'system', scheme: 'classic' },
  }
}

export function parseUserData(raw: unknown): ParseResult {
  const invalid: ParseResult = { ok: false, reason: 'invalid' }
  const versioned = z.object({ version: z.number().int() }).loose().safeParse(raw)
  if (!versioned.success) return invalid
  if (versioned.data.version > CURRENT_VERSION) return { ok: false, reason: 'newer-version' }

  let current: Versioned = versioned.data
  while (current.version < CURRENT_VERSION) {
    const migrate = migrations[current.version]
    if (!migrate) return invalid
    current = migrate(current)
  }

  const parsed = userDataSchema.safeParse(current)
  if (!parsed.success) return invalid
  return {
    ok: true,
    data: {
      ...parsed.data,
      ownedIngredientIds: unique(parsed.data.ownedIngredientIds),
      favouriteDrinkIds: unique(parsed.data.favouriteDrinkIds),
    },
  }
}

/** Removes ids that no longer exist in the content, for example after a drink is renamed. */
export function pruneUnknownIds(data: UserData, content: Content): UserData {
  const ingredients = new Set(content.ingredients.map((i) => i.id))
  const drinks = new Set(content.drinks.map((d) => d.id))
  return {
    ...data,
    ownedIngredientIds: data.ownedIngredientIds.filter((id) => ingredients.has(id)),
    favouriteDrinkIds: data.favouriteDrinkIds.filter((id) => drinks.has(id)),
  }
}
