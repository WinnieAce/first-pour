import type { Content, Drink, Ingredient } from '../content/schema'

const base = (): Pick<Ingredient, 'pairsWith' | 'substitutes' | 'allergens' | 'common'> => ({ pairsWith: [], substitutes: [], allergens: [], common: false })

const ingredients: Ingredient[] = [
  { ...base(), id: 'white-rum', name: 'White rum', category: 'spirit', description: 'Light, clean and faintly sweet.', abv: 40, common: true, pairsWith: [{ ingredientId: 'lime-juice', reason: 'Lime cuts through the sweetness of rum.' }] },
  { ...base(), id: 'bourbon', name: 'Bourbon', category: 'spirit', description: 'Sweet and oaky, with vanilla and caramel.', abv: 40, common: true, substitutes: ['rye'], pairsWith: [{ ingredientId: 'lemon-juice', reason: 'Lemon brightens the oak and vanilla.' }] },
  { ...base(), id: 'rye', name: 'Rye whiskey', category: 'spirit', description: 'Drier and spicier than bourbon.', abv: 40, substitutes: ['bourbon'] },
  { ...base(), id: 'gin', name: 'Gin', category: 'spirit', description: 'Crisp, with juniper and citrus peel.', abv: 40, common: true },
  { ...base(), id: 'lime-juice', name: 'Lime juice', category: 'fresh', description: 'Sharp and aromatic.', abv: 0 },
  { ...base(), id: 'lemon-juice', name: 'Lemon juice', category: 'fresh', description: 'Bright and sour.', abv: 0 },
  { ...base(), id: 'simple-syrup', name: 'Simple syrup', category: 'mixer', description: 'Sugar dissolved in an equal amount of water.', abv: 0 },
  { ...base(), id: 'soda-water', name: 'Soda water', category: 'mixer', description: 'Plain fizzy water.', abv: 0 },
  { ...base(), id: 'angostura-bitters', name: 'Angostura bitters', category: 'bitters', description: 'Intensely spiced; used a few drops at a time.', abv: 44.7 },
  { ...base(), id: 'egg-white', name: 'Egg white', category: 'fresh', description: 'Adds a silky foam without changing the flavour.', abv: 0, allergens: ['egg'] },
  { ...base(), id: 'ice', name: 'Ice', category: 'staple', description: 'Chills and dilutes.', abv: 0 },
  { ...base(), id: 'sugar', name: 'Sugar', category: 'staple', description: 'Plain white sugar.', abv: 0 },
]

const drinks: Drink[] = [
  {
    id: 'daiquiri', name: 'Daiquiri', family: 'sour', baseIngredientId: 'white-rum', flavour: ['sour', 'sweet'], difficulty: 'easy', method: 'shaken',
    ingredients: [
      { ingredientId: 'white-rum', amount: 60, unit: 'ml', optional: false },
      { ingredientId: 'lime-juice', amount: 25, unit: 'ml', optional: false },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml', optional: false },
    ],
    steps: [
      { text: 'Add the rum, lime juice and syrup to a shaker with ice.', ingredientIds: ['white-rum', 'lime-juice', 'simple-syrup'] },
      { text: 'Shake hard for about 12 seconds.', technique: 'shake', ingredientIds: [] },
      { text: 'Strain into a chilled glass.', technique: 'strain', ingredientIds: [] },
    ],
    glass: 'coupe', tools: [{ name: 'Shaker', alternative: 'A jam jar with a tight lid' }],
    whyItWorks: 'Rum is the strong part, lime the sour and syrup the sweet. In balance, none of the three stands out.',
  },
  {
    id: 'whiskey-sour', name: 'Whiskey Sour', family: 'sour', baseIngredientId: 'bourbon', flavour: ['sour', 'strong'], difficulty: 'medium', method: 'shaken',
    ingredients: [
      { ingredientId: 'bourbon', amount: 60, unit: 'ml', optional: false },
      { ingredientId: 'lemon-juice', amount: 25, unit: 'ml', optional: false },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml', optional: false },
      { ingredientId: 'egg-white', amount: 1, unit: 'piece', optional: true, note: 'for a foamy top' },
    ],
    steps: [
      { text: 'Add everything to a shaker with ice.', ingredientIds: ['bourbon', 'lemon-juice', 'simple-syrup', 'egg-white'] },
      { text: 'Shake hard for about 15 seconds.', technique: 'shake', ingredientIds: [] },
      { text: 'Strain into a glass over fresh ice.', technique: 'strain', ingredientIds: [] },
    ],
    glass: 'rocks', tools: [{ name: 'Shaker', alternative: 'A jam jar with a tight lid' }],
    whyItWorks: 'The same strong, sour, sweet balance as a Daiquiri, with bourbon bringing oak and vanilla.',
  },
  {
    id: 'old-fashioned', name: 'Old Fashioned', family: 'stirred-and-strong', baseIngredientId: 'bourbon', flavour: ['strong', 'bitter'], difficulty: 'easy', method: 'stirred',
    ingredients: [
      { ingredientId: 'bourbon', amount: 60, unit: 'ml', optional: false },
      { ingredientId: 'simple-syrup', amount: 5, unit: 'ml', optional: false },
      { ingredientId: 'angostura-bitters', amount: 2, unit: 'dash', optional: false },
    ],
    steps: [
      { text: 'Add the bourbon, syrup and bitters to a glass with ice.', ingredientIds: ['bourbon', 'simple-syrup', 'angostura-bitters'] },
      { text: 'Stir for about 20 seconds.', technique: 'stir', ingredientIds: [] },
    ],
    glass: 'rocks', tools: [{ name: 'Bar spoon', alternative: 'A teaspoon or chopstick' }],
    whyItWorks: 'A little sugar softens the whiskey and bitters add spice, so the spirit stays the star.',
  },
  {
    id: 'lime-soda', name: 'Lime Soda', family: 'highball', baseIngredientId: null, flavour: ['sour'], difficulty: 'easy', method: 'built',
    ingredients: [
      { ingredientId: 'lime-juice', amount: 20, unit: 'ml', optional: false },
      { ingredientId: 'soda-water', amount: 120, unit: 'ml', optional: false },
    ],
    steps: [
      { text: 'Fill a tall glass with ice, add the lime juice and top with soda.', technique: 'build', ingredientIds: ['lime-juice', 'soda-water'] },
    ],
    glass: 'highball', tools: [],
    whyItWorks: 'Sharp lime and plain bubbles make a refreshing drink with no alcohol at all.',
  },
]

export const fixtureContent: Content = { ingredients, drinks }
export const fixtureIngredientById: ReadonlyMap<string, Ingredient> = new Map(ingredients.map((i) => [i.id, i]))
export const fixtureDrink = (id: string): Drink => drinks.find((d) => d.id === id)!
