import { contentSchema, type Content } from './schema'

export type ValidationResult = { ok: true; content: Content } | { ok: false; errors: string[] }

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const id of ids) (seen.has(id) ? repeated : seen).add(id)
  return [...repeated]
}

export function validateContent(raw: unknown): ValidationResult {
  const parsed = contentSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }
  }

  const content = parsed.data
  const errors: string[] = []
  const known = new Set(content.ingredients.map((i) => i.id))
  const check = (where: string, ingredientId: string) => {
    if (!known.has(ingredientId)) errors.push(`${where} refers to unknown ingredient "${ingredientId}"`)
  }

  for (const d of duplicates(content.ingredients.map((i) => i.id))) errors.push(`duplicate ingredient id "${d}"`)
  for (const d of duplicates(content.drinks.map((i) => i.id))) errors.push(`duplicate drink id "${d}"`)

  for (const ingredient of content.ingredients) {
    for (const s of ingredient.substitutes) check(`ingredient "${ingredient.id}" substitute`, s)
    for (const p of ingredient.pairsWith) check(`ingredient "${ingredient.id}" pairing`, p.ingredientId)
  }
  for (const drink of content.drinks) {
    if (drink.baseIngredientId !== null) check(`drink "${drink.id}" base`, drink.baseIngredientId)
    for (const i of drink.ingredients) check(`drink "${drink.id}" ingredient`, i.ingredientId)
    drink.steps.forEach((step, n) => {
      for (const i of step.ingredientIds) check(`drink "${drink.id}" step ${n + 1}`, i)
    })
  }

  return errors.length === 0 ? { ok: true, content } : { ok: false, errors }
}
