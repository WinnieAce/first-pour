import { readFileSync } from 'node:fs'
import { validateContent } from '../src/content/validate'

const read = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'))

const result = validateContent({ ingredients: read('ingredients'), drinks: read('drinks') })

if (result.ok) {
  console.log(`Content OK: ${result.content.drinks.length} drinks, ${result.content.ingredients.length} ingredients.`)
} else {
  console.error(`Content has ${result.errors.length} problem(s):`)
  for (const error of result.errors) console.error(`  - ${error}`)
  process.exit(1)
}
