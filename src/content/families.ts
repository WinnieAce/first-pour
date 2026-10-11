import type { FamilyId } from './schema'

export const FAMILIES: Record<FamilyId, { name: string; description: string }> = {
  sour: {
    name: 'Sours',
    description: 'A spirit shaken with citrus juice and something sweet, so strong, sour and sweet balance each other.',
  },
  highball: {
    name: 'Highballs',
    description: 'A measure of spirit topped with a larger amount of a fizzy mixer in a tall glass of ice.',
  },
  'collins-and-fizz': {
    name: 'Collins and fizzes',
    description: 'A sour made longer and lighter by topping it with soda water.',
  },
  'stirred-and-strong': {
    name: 'Stirred and strong',
    description: 'Mostly spirit, stirred with ice until cold and silky, with only a little sweetness or bitterness added.',
  },
  'spritz-and-sparkling': {
    name: 'Spritzes and sparkling',
    description: 'Light drinks built on sparkling wine or soda, often with a bitter-sweet liqueur.',
  },
  tropical: {
    name: 'Tropical',
    description: 'Rum with fruit, and often coconut or almond, for a rich and fruity drink.',
  },
  'coffee-and-cream': {
    name: 'Coffee and cream',
    description: 'Dessert-like drinks made with coffee, cream or both.',
  },
}
