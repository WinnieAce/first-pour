import { fixtureContent } from '../test/fixtures'
import { defaultUserData, parseUserData, pruneUnknownIds, type UserData } from './userData'

const valid: UserData = {
  version: 1,
  ownedIngredientIds: ['gin', 'ice'],
  favouriteDrinkIds: ['daiquiri'],
  settings: { units: 'oz', ageConfirmed: true },
}

it('defaults own the staples', () => {
  expect(defaultUserData(['ice', 'sugar'])).toEqual({
    version: 1,
    ownedIngredientIds: ['ice', 'sugar'],
    favouriteDrinkIds: [],
    settings: { units: 'ml', ageConfirmed: false },
  })
})

it('accepts valid data', () => {
  expect(parseUserData(valid)).toEqual({ ok: true, data: valid })
})

it.each([
  null,
  'x',
  42,
  [],
  {},
  { version: 1 },
  { version: '1', ownedIngredientIds: [], favouriteDrinkIds: [], settings: { units: 'ml', ageConfirmed: true } },
  { version: 1, ownedIngredientIds: 'a', favouriteDrinkIds: [], settings: { units: 'ml', ageConfirmed: true } },
  { version: 1, ownedIngredientIds: [1], favouriteDrinkIds: [], settings: { units: 'ml', ageConfirmed: true } },
  { version: 1, ownedIngredientIds: [], favouriteDrinkIds: [], settings: { units: 'cups', ageConfirmed: true } },
  { version: 0, ownedIngredientIds: [], favouriteDrinkIds: [], settings: { units: 'ml', ageConfirmed: true } },
])('rejects %j as invalid', (raw) => {
  expect(parseUserData(raw)).toEqual({ ok: false, reason: 'invalid' })
})

it('rejects a newer version', () => {
  expect(parseUserData({ ...valid, version: 2 })).toEqual({ ok: false, reason: 'newer-version' })
})

it('removes duplicate ids', () => {
  const r = parseUserData({ ...valid, ownedIngredientIds: ['gin', 'gin', 'ice'], favouriteDrinkIds: ['daiquiri', 'daiquiri'] })
  expect(r).toEqual({ ok: true, data: valid })
})

it('drops unknown extra fields', () => {
  expect(parseUserData({ ...valid, extra: true })).toEqual({ ok: true, data: valid })
})

it('prunes ids missing from the content', () => {
  const d = pruneUnknownIds(
    { ...valid, ownedIngredientIds: ['gin', 'gone'], favouriteDrinkIds: ['daiquiri', 'gone'] },
    fixtureContent,
  )
  expect(d.ownedIngredientIds).toEqual(['gin'])
  expect(d.favouriteDrinkIds).toEqual(['daiquiri'])
  expect(d.settings).toEqual(valid.settings)
})
