import { z } from 'zod'

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be lowercase letters and digits joined by hyphens')
const text = z.string().trim().min(1)

export const ALLERGENS = ['egg', 'dairy', 'nuts', 'gluten', 'sulphites'] as const
export const INGREDIENT_CATEGORIES = ['spirit', 'liqueur', 'wine-or-fortified', 'bitters', 'mixer', 'fresh', 'staple'] as const
export const FAMILY_IDS = ['sour', 'highball', 'collins-and-fizz', 'stirred-and-strong', 'spritz-and-sparkling', 'tropical', 'coffee-and-cream'] as const
export const GLASS_IDS = ['rocks', 'highball', 'coupe', 'martini', 'wine', 'flute', 'mug'] as const
export const FLAVOURS = ['sweet', 'sour', 'bitter', 'strong'] as const
export const DIFFICULTIES = ['easy', 'medium', 'harder'] as const
export const METHODS = ['shaken', 'stirred', 'built', 'blended'] as const
export const UNITS = ['ml', 'dash', 'barspoon', 'piece'] as const
export const TECHNIQUES = ['shake', 'stir', 'muddle', 'strain', 'build'] as const

export const ingredientSchema = z.strictObject({
  id,
  name: text,
  category: z.enum(INGREDIENT_CATEGORIES),
  description: text,
  abv: z.number().min(0).max(100),
  pairsWith: z.array(z.strictObject({ ingredientId: id, reason: text })),
  substitutes: z.array(id),
  allergens: z.array(z.enum(ALLERGENS)),
  common: z.boolean(),
})

const drinkIngredientSchema = z.strictObject({
  ingredientId: id,
  amount: z.number().positive(),
  unit: z.enum(UNITS),
  optional: z.boolean(),
  note: text.optional(),
})

const stepSchema = z.strictObject({
  text,
  technique: z.enum(TECHNIQUES).optional(),
  ingredientIds: z.array(id),
})

export const drinkSchema = z.strictObject({
  id,
  name: text,
  family: z.enum(FAMILY_IDS),
  baseIngredientId: id.nullable(),
  flavour: z.array(z.enum(FLAVOURS)).min(1),
  difficulty: z.enum(DIFFICULTIES),
  method: z.enum(METHODS),
  ingredients: z.array(drinkIngredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
  glass: z.enum(GLASS_IDS),
  tools: z.array(z.strictObject({ name: text, alternative: text })),
  whyItWorks: text,
})

export const contentSchema = z.strictObject({
  ingredients: z.array(ingredientSchema),
  drinks: z.array(drinkSchema),
})

export type Allergen = (typeof ALLERGENS)[number]
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]
export type FamilyId = (typeof FAMILY_IDS)[number]
export type GlassId = (typeof GLASS_IDS)[number]
export type Flavour = (typeof FLAVOURS)[number]
export type Difficulty = (typeof DIFFICULTIES)[number]
export type Method = (typeof METHODS)[number]
export type Unit = (typeof UNITS)[number]
export type Technique = (typeof TECHNIQUES)[number]
export type Ingredient = z.infer<typeof ingredientSchema>
export type DrinkIngredient = z.infer<typeof drinkIngredientSchema>
export type Step = z.infer<typeof stepSchema>
export type Drink = z.infer<typeof drinkSchema>
export type Content = z.infer<typeof contentSchema>
