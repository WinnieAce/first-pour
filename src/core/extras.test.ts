import { drinkById } from '../content'
import { glassExtras } from './extras'

const extras = (id: string) => glassExtras(drinkById.get(id)!)

it('puts ice in drinks served over ice, but not in ones only shaken or stirred with it', () => {
  expect(extras('negroni').ice).toBe(true)
  expect(extras('singapore-sling').ice).toBe(true)
  expect(extras('moscow-mule').ice).toBe(true)
  expect(extras('daiquiri').ice).toBe(false)
  expect(extras('dry-martini').ice).toBe(false)
  expect(extras('manhattan').ice).toBe(false)
  expect(extras('gin-fizz').ice).toBe(false)
  expect(extras('pina-colada').ice).toBe(false)
})

it('gives a straw to tall drinks over ice only', () => {
  expect(extras('gin-and-tonic').straw).toBe(true)
  expect(extras('negroni').straw).toBe(false)
  expect(extras('gin-fizz').straw).toBe(false)
})

it('adds bubbles to anything made with a fizzy mixer or sparkling wine', () => {
  expect(extras('gin-and-tonic').bubbles).toBe(true)
  expect(extras('french-75').bubbles).toBe(true)
  expect(extras('negroni').bubbles).toBe(false)
})

it('puts a citrus wheel on the rim: orange where the recipe has one, else lime or lemon on a tall drink', () => {
  expect(extras('negroni').citrus).toBe('orange')
  expect(extras('gin-and-tonic').citrus).toBe('lime')
  expect(extras('tom-collins').citrus).toBe('lemon')
  expect(extras('daiquiri').citrus).toBeNull()
})

it('shows steam on a hot drink and nothing cold on it', () => {
  expect(extras('irish-coffee')).toMatchObject({ steam: true, ice: false, straw: false })
  expect(extras('espresso-martini').steam).toBe(false)
})

it('uses the fresh lime or lemon a recipe calls for as its citrus wheel', () => {
  expect(extras('caipirinha').citrus).toBe('lime')
  expect(extras('horses-neck').citrus).toBe('lemon')
  expect(extras('bloody-mary').citrus).toBe('lemon')
})
