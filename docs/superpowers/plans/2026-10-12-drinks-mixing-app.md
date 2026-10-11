# Drinks Mixing App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, installable, offline-capable web app that teaches beginners to mix cocktails from the bottles they own.

**Architecture:** A static single-page app. Curated content lives in JSON files validated at build time; pure-function core logic does matching, scaling and strength; user data is saved on the device behind one storage interface. No server.

**Tech Stack:** TypeScript, React, Vite, React Router, Zod, idb-keyval, vite-plugin-pwa, Vitest, Testing Library, fake-indexeddb. Hosting: Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-10-12-drinks-mixing-app-design.md`

## Global Constraints

- Working app name: `First Pour`, held in `src/config.ts` as `APP_NAME`. The owner may rename it.
- No server, no accounts, no cookies, no personal data. Nothing the user enters leaves the device.
- All volumes stored in ml. 1 oz = 30 ml.
- Servings range 1 to 8.
- Staples (ice, water, sugar, salt) are owned by default.
- Standard drink = 10 g of alcohol; alcohol density 0.789 g/ml.
- Dilution: shaken and blended 25%, stirred 20%, built 10%.
- Tap targets at least 44 by 44 CSS pixels. WCAG 2.1 AA.
- All text and illustrations original. No photographs.
- Plain language; explain any bar term where it first appears on a page.
- Core logic (`src/core`) imports nothing from `src/storage` or `src/screens`.
- Supported browsers: current and previous major versions of Chrome, Safari, Firefox, Edge.
- Use the latest stable version of each dependency at install time.

## Review Focus

1. **Substitute chains.** A substitutes for B, B for C, user owns A: C is *not* available. (Task 3)
2. **Tiny and zero measures.** 5 ml in oz shows `¼ oz`, never `0 oz`; a drink with no ml ingredients shows 0% and does not divide by zero. (Tasks 4, 5)
3. **Search typed loosely.** `pina colada`, `  PIÑA `, and an empty query all behave sensibly: accents, case and outer spaces are ignored; empty returns everything. (Task 6)
4. **Backup files from the wild.** Duplicate ids, ids not in the content, a non-JSON file, and a file from a newer version are each handled without touching existing data until a valid import is confirmed. (Task 7)
5. **Storage failing.** IndexedDB missing or throwing on open leaves a working app for the session with a visible notice. (Tasks 7, 8)

## File Structure

```
index.html
vite.config.ts
scripts/validate-content.ts      build-time content check
src/
  main.tsx                       mounts the app, registers the service worker
  App.tsx                        routes and age gate
  config.ts                      APP_NAME, FEEDBACK_URL
  styles.css                     all styling, CSS custom properties
  content/
    schema.ts                    Zod schemas and types
    validate.ts                  cross-reference checks
    families.ts                  family names and one-line descriptions
    ingredients.json
    drinks.json
    index.ts                     validated content and lookup maps
  core/
    matching.ts                  available / makeable / one short / next purchase
    measures.ts                  scaling, rounding, ml and oz formatting
    strength.ts                  strength, grams, standard drinks
    allergens.ts
    search.ts                    search and filters
  storage/
    userData.ts                  type, defaults, migration, pruning
    store.ts                     UserDataStore interface and implementations
    backup.ts                    export and import
    UserDataContext.tsx          React provider and hook
  components/
    Layout.tsx  DrinkCard.tsx  GlassIcon.tsx  ResponsibleNotice.tsx  Measure.tsx
  screens/
    AgeGate.tsx  Library.tsx  DrinkPage.tsx  IngredientPage.tsx  MyBar.tsx
    MakingMode.tsx  Favourites.tsx  Settings.tsx  Terms.tsx  NotFound.tsx
  hooks/useWakeLock.ts
  test/fixtures.ts               small content set used by all tests
```

Tests sit beside the file they test as `*.test.ts(x)`.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/config.ts`, `src/styles.css`, `src/App.test.tsx`, `.gitignore`

**Interfaces:**
- Produces: `APP_NAME: string` (`'First Pour'`) and `FEEDBACK_URL: string` (`''`) from `src/config.ts`; npm scripts `dev`, `build`, `test` (`vitest run`), `validate-content`.

- [ ] **Step 1:** Run `git init`, then `npm create vite@latest . -- --template react-ts`.
- [ ] **Step 2:** Install: `npm i react-router-dom zod idb-keyval` and `npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom fake-indexeddb tsx vite-plugin-pwa`.
- [ ] **Step 3:** Configure Vitest in `vite.config.ts` with `environment: 'jsdom'`, `globals: true`, and a setup file importing `@testing-library/jest-dom` and `fake-indexeddb/auto`.
- [ ] **Step 4:** Write the failing test in `src/App.test.tsx`:

```tsx
it('renders the app name', () => {
  render(<App />);
  expect(screen.getByText('First Pour')).toBeInTheDocument();
});
```

- [ ] **Step 5:** Run `npx vitest run src/App.test.tsx`. Expected: FAIL.
- [ ] **Step 6:** Replace the template `App.tsx` with a component rendering `APP_NAME` in an `<h1>`; delete template assets and CSS.
- [ ] **Step 7:** Run `npm test` and `npm run build`. Expected: both pass.
- [ ] **Step 8:** Commit: `chore: scaffold project`.

---

### Task 2: Content schema and validation

**Files:**
- Create: `src/content/schema.ts`, `src/content/validate.ts`, `src/content/families.ts`, `src/content/ingredients.json`, `src/content/drinks.json`, `src/content/index.ts`, `src/test/fixtures.ts`, `scripts/validate-content.ts`
- Test: `src/content/validate.test.ts`
- Modify: `package.json` (add `"validate-content": "tsx scripts/validate-content.ts"` and `"prebuild": "npm run validate-content"`)

**Interfaces:**
- Produces, from `schema.ts`: types `Ingredient`, `Drink`, `Content = { ingredients: Ingredient[]; drinks: Drink[] }`, `Unit`, `Allergen`, `IngredientCategory`, `FamilyId`, `GlassId`, `Flavour`, `Difficulty`, `Method`, with fields exactly as spec sections 5.2 and 5.3. `Drink.baseIngredientId` is `string | null`. `DrinkIngredient = { ingredientId: string; amount: number; unit: Unit; optional: boolean; note?: string }`. `Step = { text: string; technique?: 'shake' | 'stir' | 'muddle' | 'strain' | 'build'; ingredientIds: string[] }`.
- Produces, from `validate.ts`: `validateContent(raw: unknown): { ok: true; content: Content } | { ok: false; errors: string[] }`.
- Produces, from `families.ts`: `FAMILIES: Record<FamilyId, { name: string; description: string }>`.
- Produces, from `index.ts`: `content: Content`, `ingredientById: ReadonlyMap<string, Ingredient>`, `drinkById: ReadonlyMap<string, Drink>`, `stapleIds: string[]`.
- Produces, from `fixtures.ts`: `fixtureContent: Content` and `fixtureIngredientById`, containing:
  - Ingredients: `white-rum` (40), `bourbon` (40, substitutes `rye`), `rye` (40, substitutes `bourbon`), `gin` (40), `lime-juice`, `lemon-juice`, `simple-syrup`, `soda-water`, `angostura-bitters` (44.7), `egg-white` (allergen `egg`), `ice` and `sugar` (category `staple`).
  - Drinks: `daiquiri` (shaken: white-rum 60, lime-juice 25, simple-syrup 15), `whiskey-sour` (shaken: bourbon 60, lemon-juice 25, simple-syrup 15, egg-white 1 piece optional), `old-fashioned` (stirred: bourbon 60, simple-syrup 5, angostura-bitters 2 dash), `lime-soda` (built, no base: lime-juice 20, soda-water 120).

- [ ] **Step 1: Write the failing tests**

```ts
it('accepts the fixture content', () => {
  expect(validateContent(fixtureContent).ok).toBe(true);
});
it('reports a duplicate id', () => {
  const raw = structuredClone(fixtureContent);
  raw.drinks.push(raw.drinks[0]);
  const r = validateContent(raw);
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.errors.join()).toContain('daiquiri');
});
it.each([
  ['drink ingredient', (c) => { c.drinks[0].ingredients[0].ingredientId = 'nope'; }],
  ['substitute',       (c) => { c.ingredients[0].substitutes = ['nope']; }],
  ['pairing',          (c) => { c.ingredients[0].pairsWith = [{ ingredientId: 'nope', reason: 'x' }]; }],
  ['base',             (c) => { c.drinks[0].baseIngredientId = 'nope'; }],
  ['step ingredient',  (c) => { c.drinks[0].steps[0].ingredientIds = ['nope']; }],
])('reports a dangling %s reference', (_n, mutate) => {
  const raw = structuredClone(fixtureContent); mutate(raw);
  expect(validateContent(raw).ok).toBe(false);
});
it('reports a malformed record', () => {
  expect(validateContent({ ingredients: [{ id: 'x' }], drinks: [] }).ok).toBe(false);
});
it('rejects a negative amount and an abv above 100', () => { /* two mutations, both ok: false */ });
it('the shipped content is valid', () => {
  expect(validateContent({ ingredients, drinks }).ok).toBe(true);
});
```

- [ ] **Step 2:** Run `npx vitest run src/content`. Expected: FAIL.
- [ ] **Step 3:** Implement `schema.ts` with Zod. Ids match `/^[a-z0-9]+(-[a-z0-9]+)*$/`; `abv` 0–100; `amount` > 0; `steps` and `ingredients` non-empty.
- [ ] **Step 4:** Implement `validateContent`: parse with the schema, then collect every duplicate-id and dangling-reference error (do not stop at the first).
- [ ] **Step 5:** Write `families.ts` with the seven families from the spec, each with a name and a one-sentence beginner description.
- [ ] **Step 6:** Seed `ingredients.json` and `drinks.json` with the fixture set, with real descriptions, pairings, steps and `whyItWorks` text. (Task 14 expands to 40.)
- [ ] **Step 7:** Implement `index.ts` (validate on import, throw with the joined errors if invalid, build the maps) and `scripts/validate-content.ts` (print errors and `process.exit(1)` if invalid).
- [ ] **Step 8:** Run `npm test` and `npm run build`. Expected: pass. Temporarily break a reference in `drinks.json`, run `npm run build`, confirm it fails, then revert.
- [ ] **Step 9:** Commit: `feat: content schema and build-time validation`.

---

### Task 3: Core — bar matching

**Files:**
- Create: `src/core/matching.ts`
- Test: `src/core/matching.test.ts`

**Interfaces:**
- Consumes: `Content`, `Drink`, `Ingredient` (Task 2).
- Produces:
  - `isAvailable(ingredient: Ingredient, owned: ReadonlySet<string>): boolean`
  - `missingIngredientIds(drink: Drink, owned: ReadonlySet<string>, byId: ReadonlyMap<string, Ingredient>): string[]`
  - `type BarResults = { makeable: Drink[]; oneShort: { drink: Drink; missingId: string }[]; nextPurchases: { ingredientId: string; unlocks: number }[] }`
  - `matchBar(content: Content, owned: ReadonlySet<string>): BarResults`

- [ ] **Step 1: Write the failing tests** (all against `fixtureContent`; `ids(x)` maps drinks to ids)

```ts
it('finds makeable drinks', () => {
  const r = matchBar(fixtureContent, new Set(['white-rum', 'lime-juice', 'simple-syrup']));
  expect(ids(r.makeable)).toEqual(['daiquiri']);
  expect(r.oneShort.map(o => [o.drink.id, o.missingId])).toEqual([['lime-soda', 'soda-water']]);
});
it('counts an owned substitute as available', () => {
  const r = matchBar(fixtureContent, new Set(['rye', 'lemon-juice', 'simple-syrup']));
  expect(ids(r.makeable)).toEqual(['whiskey-sour']);
  expect(r.oneShort.map(o => [o.drink.id, o.missingId])).toEqual([['old-fashioned', 'angostura-bitters']]);
});
it('ignores optional ingredients', () => { /* whiskey-sour makeable without egg-white */ });
it('ranks next purchases by unlocks, then usage, then name', () => {
  const r = matchBar(fixtureContent, new Set(['lime-juice', 'simple-syrup', 'lemon-juice']));
  expect(r.nextPurchases).toEqual([
    { ingredientId: 'bourbon', unlocks: 1 },
    { ingredientId: 'soda-water', unlocks: 1 },
    { ingredientId: 'white-rum', unlocks: 1 },
    { ingredientId: 'rye', unlocks: 1 },
  ]);
});
it('omits purchases that unlock nothing', () => { /* gin never appears */ });
it('does not follow substitute chains', () => {
  // inline content: a substitutes [b]; b substitutes [c]; drink needs a; owned {c} → not makeable
});
it('returns empty groups for an empty bar and for empty content', () => {});
```

- [ ] **Step 2:** Run `npx vitest run src/core/matching.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. `nextPurchases` is computed by simulation: for each unowned ingredient, count drinks makeable with it added minus drinks makeable now. `makeable` and `oneShort` are sorted by drink name.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: bar matching`.

---

### Task 4: Core — measures

**Files:**
- Create: `src/core/measures.ts`
- Test: `src/core/measures.test.ts`

**Interfaces:**
- Produces:
  - `type DisplayUnits = 'ml' | 'oz'`
  - `MIN_SERVINGS = 1`, `MAX_SERVINGS = 8`, `clampServings(n: number): number` (rounds, then clamps; `NaN` gives 1)
  - `scaleAmount(amount: number, servings: number): number`
  - `formatMeasure(amount: number, unit: Unit, display: DisplayUnits): string`

- [ ] **Step 1: Write the failing tests**

```ts
it.each([
  [45, 'ml', 'ml', '45 ml'], [22.5, 'ml', 'ml', '22.5 ml'], [7.5, 'ml', 'ml', '7.5 ml'],
  [33, 'ml', 'ml', '35 ml'], [1, 'ml', 'ml', '2.5 ml'], [480, 'ml', 'ml', '480 ml'],
  [30, 'ml', 'oz', '1 oz'], [45, 'ml', 'oz', '1½ oz'], [22.5, 'ml', 'oz', '¾ oz'],
  [5, 'ml', 'oz', '¼ oz'], [60, 'ml', 'oz', '2 oz'], [97.5, 'ml', 'oz', '3¼ oz'],
  [1, 'dash', 'oz', '1 dash'], [2, 'dash', 'ml', '2 dashes'],
  [1, 'barspoon', 'ml', '1 barspoon'], [3, 'barspoon', 'oz', '3 barspoons'],
  [1, 'piece', 'ml', '1'], [4, 'piece', 'oz', '4'],
])('formats %s %s in %s as %s', (a, u, d, out) => {
  expect(formatMeasure(a, u, d)).toBe(out);
});
it('scales', () => { expect(scaleAmount(22.5, 4)).toBe(90); });
it.each([[0, 1], [9, 8], [2.6, 3], [NaN, 1], [-3, 1]])('clamps servings %s to %s', (n, out) => {
  expect(clampServings(n)).toBe(out);
});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Ml: nearest 2.5 below 30, nearest 5 from 30 up, minimum 2.5. Oz: `amount / 30` to the nearest quarter, minimum ¼, written with `¼ ½ ¾` glyphs and no space between whole and fraction.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: measure scaling and formatting`.

---

### Task 5: Core — strength and allergens

**Files:**
- Create: `src/core/strength.ts`, `src/core/allergens.ts`
- Test: `src/core/strength.test.ts`, `src/core/allergens.test.ts`

**Interfaces:**
- Produces:
  - `type Strength = { abvPercent: number; alcoholGrams: number; standardDrinks: number }`
  - `calculateStrength(drink: Drink, byId: ReadonlyMap<string, Ingredient>): Strength` — `abvPercent` whole number, the other two to one decimal place
  - `ALLERGEN_ORDER: Allergen[]` = `['egg', 'dairy', 'nuts', 'gluten', 'sulphites']`
  - `drinkAllergens(drink: Drink, byId: ReadonlyMap<string, Ingredient>): Allergen[]` in `ALLERGEN_ORDER`, no duplicates

- [ ] **Step 1: Write the failing tests**

```ts
it('daiquiri (shaken)', () => {
  expect(calculateStrength(drink('daiquiri'), byId)).toEqual({ abvPercent: 19, alcoholGrams: 18.9, standardDrinks: 1.9 });
});
it('old fashioned (stirred, dashes ignored)', () => {
  // 24 ml alcohol / (65 × 1.2) = 30.77%
  expect(calculateStrength(drink('old-fashioned'), byId)).toEqual({ abvPercent: 31, alcoholGrams: 18.9, standardDrinks: 1.9 });
});
it('no-alcohol drink is zero', () => {
  expect(calculateStrength(drink('lime-soda'), byId)).toEqual({ abvPercent: 0, alcoholGrams: 0, standardDrinks: 0 });
});
it('a drink with no ml ingredients is zero, not NaN', () => { /* inline drink of pieces only */ });
it('excludes optional ingredients from strength', () => { /* add optional 30 ml gin float: result unchanged */ });

it('includes allergens from optional ingredients', () => {
  expect(drinkAllergens(drink('whiskey-sour'), byId)).toEqual(['egg']);
});
it('returns allergens once each, in fixed order', () => { /* inline: nuts + egg + egg → ['egg','nuts'] */ });
it('returns an empty list when there are none', () => {});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement per spec 6.3 and 6.4 and the Global Constraints values.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: strength and allergen calculation`.

---

### Task 6: Core — search and filters

**Files:**
- Create: `src/core/search.ts`
- Test: `src/core/search.test.ts`

**Interfaces:**
- Produces:
  - `normalise(text: string): string` — trims, lowercases, strips diacritics, collapses inner whitespace
  - `type DrinkFilters = { query: string; baseIngredientId?: string; family?: FamilyId; flavour?: Flavour; difficulty?: Difficulty; makeableOnly: boolean }`
  - `EMPTY_FILTERS: DrinkFilters`
  - `filterDrinks(content: Content, filters: DrinkFilters, makeableIds: ReadonlySet<string>): Drink[]` sorted by name

- [ ] **Step 1: Write the failing tests**

```ts
it('empty filters return every drink by name', () => {
  expect(ids(filterDrinks(fixtureContent, EMPTY_FILTERS, new Set()))).toEqual(['daiquiri', 'lime-soda', 'old-fashioned', 'whiskey-sour']);
});
it('matches drink names loosely', () => {
  for (const q of ['daiq', '  DAIQUIRI ', 'Daïquiri']) expect(ids(run({ query: q }))).toEqual(['daiquiri']);
});
it('matches ingredient names', () => {
  expect(ids(run({ query: 'bourbon' }))).toEqual(['old-fashioned', 'whiskey-sour']);
});
it('combines filters with AND', () => { /* family sour + baseIngredientId bourbon → whiskey-sour */ });
it('filters by flavour and by difficulty', () => {});
it('makeableOnly keeps only ids in makeableIds', () => {});
it('returns [] when nothing matches', () => {});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. A drink matches a query if the normalised query is a substring of its normalised name or of any of its ingredients' normalised names.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: drink search and filters`.

---

### Task 7: Storage

**Files:**
- Create: `src/storage/userData.ts`, `src/storage/store.ts`, `src/storage/backup.ts`
- Test: `src/storage/userData.test.ts`, `src/storage/store.test.ts`, `src/storage/backup.test.ts`

**Interfaces:**
- Produces, from `userData.ts`:
  - `type UserData = { version: 1; ownedIngredientIds: string[]; favouriteDrinkIds: string[]; settings: { units: 'ml' | 'oz'; ageConfirmed: boolean } }`
  - `CURRENT_VERSION = 1`
  - `defaultUserData(stapleIds: string[]): UserData` — staples owned, units `ml`, `ageConfirmed` false
  - `type ParseResult = { ok: true; data: UserData } | { ok: false; reason: 'invalid' | 'newer-version' }`
  - `parseUserData(raw: unknown): ParseResult` — validates, migrates older versions, removes duplicate ids
  - `pruneUnknownIds(data: UserData, content: Content): UserData`
- Produces, from `store.ts`:
  - `interface UserDataStore { readonly persistent: boolean; load(): Promise<UserData | null>; save(data: UserData): Promise<void> }`
  - `createStore(): Promise<UserDataStore>` — IndexedDB via `idb-keyval` under key `user-data`; if IndexedDB is absent or a probe read throws, returns an in-memory store with `persistent: false`
- Produces, from `backup.ts`:
  - `serialiseBackup(data: UserData): string` (pretty JSON)
  - `parseBackup(text: string): ParseResult`
  - `backupFileName(date: Date): string` — `first-pour-backup-YYYY-MM-DD.json`

- [ ] **Step 1: Write the failing tests**

```ts
// userData.test.ts
it('defaults own the staples', () => {
  expect(defaultUserData(['ice', 'sugar'])).toEqual({ version: 1, ownedIngredientIds: ['ice', 'sugar'], favouriteDrinkIds: [], settings: { units: 'ml', ageConfirmed: false } });
});
it('accepts valid data', () => {});
it.each([null, 'x', {}, { version: 1 }, { version: 1, ownedIngredientIds: 'a', favouriteDrinkIds: [], settings: {} }])('rejects %j as invalid', (raw) => {
  expect(parseUserData(raw)).toEqual({ ok: false, reason: 'invalid' });
});
it('rejects a newer version', () => {
  expect(parseUserData({ ...valid, version: 2 })).toEqual({ ok: false, reason: 'newer-version' });
});
it('removes duplicate ids', () => {});
it('prunes ids missing from the content', () => {
  const d = pruneUnknownIds({ ...valid, ownedIngredientIds: ['gin', 'gone'], favouriteDrinkIds: ['daiquiri', 'gone'] }, fixtureContent);
  expect(d.ownedIngredientIds).toEqual(['gin']); expect(d.favouriteDrinkIds).toEqual(['daiquiri']);
});

// store.test.ts
it('load returns null before any save', async () => {});
it('round-trips saved data', async () => {});
it('falls back to a non-persistent store when indexedDB is missing', async () => {
  vi.stubGlobal('indexedDB', undefined);
  const s = await createStore();
  expect(s.persistent).toBe(false);
  await s.save(valid); expect(await s.load()).toEqual(valid);
});
it('load returns null when the stored value is corrupt', async () => {});

// backup.test.ts
it('round-trips', () => { expect(parseBackup(serialiseBackup(valid))).toEqual({ ok: true, data: valid }); });
it('rejects non-JSON text as invalid', () => { expect(parseBackup('not json')).toEqual({ ok: false, reason: 'invalid' }); });
it('rejects a newer-version file', () => {});
it('names the file by date', () => { expect(backupFileName(new Date('2026-10-12T09:00:00Z'))).toBe('first-pour-backup-2026-10-12.json'); });
```

- [ ] **Step 2:** Run `npx vitest run src/storage`. Expected: FAIL.
- [ ] **Step 3:** Implement `userData.ts` (Zod schema; a `migrations` map keyed by version, empty for now, so version 2 has a place to go).
- [ ] **Step 4:** Implement `store.ts` and `backup.ts`.
- [ ] **Step 5:** Run. Expected: PASS.
- [ ] **Step 6:** Commit: `feat: on-device storage and backup`.

---

### Task 8: App shell, age gate and static pages

**Files:**
- Create: `src/storage/UserDataContext.tsx`, `src/components/Layout.tsx`, `src/components/ResponsibleNotice.tsx`, `src/screens/AgeGate.tsx`, `src/screens/Terms.tsx`, `src/screens/NotFound.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/App.test.tsx`
- Test: `src/screens/AgeGate.test.tsx`, `src/storage/UserDataContext.test.tsx`

**Interfaces:**
- Consumes: Tasks 2 and 7.
- Produces:
  - `<UserDataProvider store={UserDataStore}>` — loads, prunes against `content`, falls back to `defaultUserData(stapleIds)`; saves after every change.
  - `useUserData(): { data: UserData; persistent: boolean; toggleOwned(id: string): void; toggleFavourite(id: string): void; setUnits(u: 'ml' | 'oz'): void; confirmAge(): void; replaceAll(data: UserData): void }`
  - `<Layout>`: header with `APP_NAME`, bottom navigation (Drinks `/`, My bar `/bar`, Favourites `/favourites`, Settings `/settings`), footer with a Terms link, and a "Changes won't be saved in this browser session" notice when `persistent` is false.
  - `<ResponsibleNotice />`: the text "Please drink responsibly. Never drink and drive."
  - `renderApp(ui, { data?, store? })` test helper in `src/test/render.tsx`, wrapping in a memory router and provider.
  - Routes: `/`, `/drinks/:id`, `/drinks/:id/make`, `/ingredients/:id`, `/bar`, `/favourites`, `/settings`, `/terms`, `*`. Screens not yet built render a heading with their name.

- [ ] **Step 1: Write the failing tests**

```tsx
it('shows the age gate on first visit and hides drink content', async () => {
  renderApp(<App />);
  expect(await screen.findByRole('heading', { name: /legal drinking age/i })).toBeInTheDocument();
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
});
it('confirming saves the choice and shows the library', async () => {
  const store = memoryStore();
  renderApp(<App />, { store });
  await user.click(await screen.findByRole('button', { name: /yes, i am/i }));
  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect((await store.load())!.settings.ageConfirmed).toBe(true);
});
it('declining shows a message and no content, and is not saved', async () => {
  // click "No"; expect /come back when/i; store.load() is null or ageConfirmed false
});
it('does not show the gate once confirmed', async () => {});
it('the terms page is readable without confirming', async () => { /* route /terms */ });
it('shows the not-saved notice when the store is not persistent', async () => {});
it('unknown addresses show not-found with a link to the library', async () => {});
it('toggleOwned and toggleFavourite add then remove, and persist', async () => {});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the provider, layout, routes and three screens. The age gate text is "Are you of legal drinking age in your country?" with buttons "Yes, I am" and "No", and includes `<ResponsibleNotice />`. The Terms page states: no accounts, no cookies, no personal data collected, data stays on this device, content is for adults of legal drinking age, recipes are guidance only.
- [ ] **Step 4:** Write base styles: CSS custom properties for colour and spacing, a phone-first single column, 44px minimum control size, visible focus outlines, `prefers-reduced-motion` and `prefers-color-scheme` support.
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit: `feat: app shell, age gate and terms`.

---

### Task 9: Drink library and drink page

**Files:**
- Create: `src/screens/Library.tsx`, `src/screens/DrinkPage.tsx`, `src/components/DrinkCard.tsx`, `src/components/GlassIcon.tsx`, `src/components/Measure.tsx`
- Test: `src/screens/Library.test.tsx`, `src/screens/DrinkPage.test.tsx`

**Interfaces:**
- Consumes: `filterDrinks`, `EMPTY_FILTERS`, `matchBar`, `calculateStrength`, `drinkAllergens`, `formatMeasure`, `FAMILIES`, `useUserData`.
- Produces:
  - `<GlassIcon glass={GlassId} />` — one inline SVG per glass type, `aria-hidden`.
  - `<Measure amount unit servings? />` — reads units from `useUserData`, renders `formatMeasure(scaleAmount(amount, servings ?? 1), unit, units)`.
  - `<DrinkCard drink makeable />` — link to `/drinks/:id` with name, family name, glass icon and a "You can make this" badge.

Screens take content through a `ContentContext` defaulting to the shipped content, so tests supply `fixtureContent`.

- [ ] **Step 1: Write the failing tests**

```tsx
// Library
it('lists every drink by name', () => {});
it('typing in search narrows the list', async () => { /* type "bourbon" → Old Fashioned, Whiskey Sour */ });
it('filters by family, base spirit, flavour and difficulty', async () => {});
it('"Only drinks I can make" uses the bar', async () => { /* owned rum, lime, syrup → Daiquiri only */ });
it('shows a helpful message and a clear-filters button when nothing matches', async () => {});

// DrinkPage
it('shows ingredients with measures in the chosen units', () => {
  // units ml → "60 ml"; units oz → "2 oz"
});
it('marks owned and missing ingredients', () => {});
it('shows why it works, the family description, and links to other family members', () => {});
it('shows strength, standard drinks labelled approximate, and allergens', () => {
  // whiskey-sour: "Contains: egg"; text /approximate/i and /varies by country/i
});
it('lists substitutes for an ingredient', () => { /* Bourbon: "or Rye" */ });
it('favourite button toggles and persists', async () => {});
it('links to making mode', () => { /* href /drinks/daiquiri/make */ });
it('shows the responsible-drinking notice', () => {});
it('an unknown drink id shows not-found', () => {});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the components, then `Library` (search box, four selects, one checkbox; filter state in the URL query string so back navigation keeps it), then `DrinkPage`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: drink library and drink page`.

---

### Task 10: Ingredient pages and My bar

**Files:**
- Create: `src/screens/IngredientPage.tsx`, `src/screens/MyBar.tsx`
- Test: `src/screens/IngredientPage.test.tsx`, `src/screens/MyBar.test.tsx`

**Interfaces:**
- Consumes: `matchBar`, `useUserData`, `DrinkCard`.

- [ ] **Step 1: Write the failing tests**

```tsx
// IngredientPage
it('shows the description, pairings with reasons, and substitutes as links', () => {});
it('lists every drink that uses it', () => { /* bourbon → Old Fashioned, Whiskey Sour */ });
it('the bar control adds and removes it', async () => {});
it('an unknown ingredient id shows not-found', () => {});

// MyBar
it('shows common bottles in a quick-pick section first', () => {});
it('groups the remaining ingredients by category', () => {});
it('staples start ticked and can be unticked', async () => {});
it('ticking updates "Can make now" immediately', async () => {
  // tick White rum, Lime juice, Simple syrup → Daiquiri appears under "Can make now"
});
it('"One ingredient short" names the missing ingredient', async () => {});
it('"Best next purchase" lists ingredients with how many drinks each unlocks', async () => {
  // "Bourbon — unlocks 1 drink"
});
it('with an empty bar, explains what to do first', () => {});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. `MyBar` shows results above the full ingredient list once anything non-staple is owned; each ingredient is a labelled checkbox with a link to its page.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: ingredient pages and my bar`.

---

### Task 11: Making mode

**Files:**
- Create: `src/screens/MakingMode.tsx`, `src/hooks/useWakeLock.ts`
- Test: `src/screens/MakingMode.test.tsx`, `src/hooks/useWakeLock.test.ts`

**Interfaces:**
- Consumes: `Measure`, `clampServings`, `MIN_SERVINGS`, `MAX_SERVINGS`, `useUserData`.
- Produces: `useWakeLock(active: boolean): void` — requests `navigator.wakeLock.request('screen')` while active, re-requests when the page becomes visible again, releases on unmount, and does nothing if the API is missing or the request rejects.

Technique explanations live in a `TECHNIQUES: Record<Technique, { what: string; why: string; noTool: string }>` constant in `MakingMode.tsx`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('starts with a "gather" screen listing all ingredients, glass and tools with alternatives', () => {});
it('shows one step at a time with "Step 1 of N"', () => {});
it('next and back move between steps; back is disabled on the first, next becomes "Done" on the last', async () => {});
it('"Done" returns to the drink page', async () => {});
it('each step shows its ingredients with measures', () => {});
it('changing servings to 4 scales measures', async () => { /* 60 ml → 240 ml */ });
it('servings cannot go below 1 or above 8', async () => {});
it('the units switch changes measures and saves the setting', async () => { /* 60 ml → 2 oz */ });
it('a step with a technique shows what to do, why, and the no-tool alternative', () => {});
it('an unknown drink id shows not-found', () => {});

// useWakeLock
it('requests a lock when active and releases on unmount', async () => {});
it('does nothing when navigator.wakeLock is undefined', () => {});
it('swallows a rejected request', async () => {});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Making mode hides the bottom navigation, uses a larger type scale, and puts next and back as full-width buttons at the bottom of the screen. Servings and the current step are component state, not saved.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: making mode`.

---

### Task 12: Favourites and settings

**Files:**
- Create: `src/screens/Favourites.tsx`, `src/screens/Settings.tsx`
- Modify: `src/components/Layout.tsx` (feedback link in footer)
- Test: `src/screens/Favourites.test.tsx`, `src/screens/Settings.test.tsx`

**Interfaces:**
- Consumes: `serialiseBackup`, `parseBackup`, `backupFileName`, `pruneUnknownIds`, `useUserData`, `FEEDBACK_URL`.

- [ ] **Step 1: Write the failing tests**

```tsx
// Favourites
it('lists favourited drinks by name', () => {});
it('explains how to add favourites when there are none', () => {});

// Settings
it('switches units and saves', async () => {});
it('export downloads a JSON file named by date', async () => { /* spy on URL.createObjectURL and the anchor's download attribute */ });
it('importing a valid file asks for confirmation, then replaces data', async () => {});
it('cancelling the confirmation leaves data untouched', async () => {});
it('an invalid file shows "That file isn\'t a First Pour backup" and leaves data untouched', async () => {});
it('a newer-version file shows "This backup is from a newer version of the app"', async () => {});
it('import drops ids that are not in the content', async () => {});
it('reminds the user that clearing browser data erases their bar', () => {});
it('shows the feedback link only when FEEDBACK_URL is set', () => {});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Import uses a file input accepting `.json`; confirmation is an in-page dialog, not `window.confirm`. The feedback link opens in a new tab with `rel="noopener"`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: favourites, settings and backup`.

---

### Task 13: Offline, install and updates

**Files:**
- Modify: `vite.config.ts`, `src/main.tsx`, `index.html`
- Create: `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`, `public/favicon.svg`

**Interfaces:**
- Consumes: `APP_NAME`.

- [ ] **Step 1:** Configure `vite-plugin-pwa` with `registerType: 'prompt'`, `workbox.globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}']`, `navigateFallback: 'index.html'`, and a manifest: name and short name `First Pour`, `display: 'standalone'`, `start_url: '/'`, theme and background colours from `styles.css`, the three icons.
- [ ] **Step 2:** In `main.tsx`, call `registerSW()` from `virtual:pwa-register` and never call the returned update function, so a new version waits until every tab is closed and applies on next open.
- [ ] **Step 3:** Draw the icon as an original SVG (a simple glass) and export the PNG sizes. Add `theme-color`, description and `apple-touch-icon` tags to `index.html`.
- [ ] **Step 4:** Verify: `npm run build && npx vite preview`, open in Chrome, then in DevTools set Network to Offline and reload. Expected: every route loads, a drink can be opened and made, the bar can be edited. Application → Manifest shows no errors and the install prompt is offered.
- [ ] **Step 5:** Verify updates: change a string, rebuild, reload the open tab. Expected: the old version stays until all tabs are closed and the app is reopened.
- [ ] **Step 6:** Commit: `feat: offline support and install`.

---

### Task 14: Curated content

**Files:**
- Modify: `src/content/ingredients.json`, `src/content/drinks.json`

The 40 drinks:

- **Sour:** Whiskey Sour, Daiquiri, Margarita, Gimlet, Sidecar, Cosmopolitan, Amaretto Sour, Bee's Knees
- **Highball:** Gin and Tonic, Whisky Highball, Cuba Libre, Moscow Mule, Dark and Stormy, Paloma, No-Alcohol Mule, Lemon Lime and Bitters
- **Collins and fizz:** Tom Collins, Mojito, Gin Fizz, Virgin Mojito, Shirley Temple
- **Stirred and strong:** Old Fashioned, Manhattan, Negroni, Dry Martini, Boulevardier, Rusty Nail
- **Spritz and sparkling:** Aperol Spritz, Americano, French 75, Mimosa, Bellini, Kir Royale
- **Tropical:** Piña Colada, Mai Tai, Virgin Piña Colada
- **Coffee and cream:** White Russian, Espresso Martini, Irish Coffee, Brandy Alexander

- [ ] **Step 1:** Add every ingredient these drinks need, each with a tasting description, at least two pairings with reasons, sensible substitutes, allergens (orgeat and amaretto: `nuts`; cream and coffee liqueurs with dairy: `dairy`; egg white: `egg`; wines: `sulphites`), and `common: true` for about 12 bottles a beginner is most likely to own.
- [ ] **Step 2:** Write the drinks in batches by family. For each: measures in ml, 3–6 steps tagged with techniques, tools with a household alternative, and a `whyItWorks` of 2–4 sentences that names the balance (for example strong, sour, sweet) in plain words.
- [ ] **Step 3:** Run `npm run validate-content` and `npm test` after each batch. Expected: pass.
- [ ] **Step 4:** Check calculated strength for every drink against a plausible range (no-alcohol 0%; highballs 5–12%; sours 15–22%; stirred 25–35%) and fix any measure or abv that falls outside it.
- [ ] **Step 5:** Owner review: the owner reads every drink and ingredient page in the running app and marks corrections. Apply them.
- [ ] **Step 6:** Commit per family: `content: add <family> drinks`.

---

### Task 15: Launch checks and deployment

**Files:**
- Create: `README.md` (run, test, build, how to add a drink, how to deploy)
- Modify: `src/config.ts` (set `FEEDBACK_URL` when the owner supplies it)

- [ ] **Step 1:** Run Lighthouse (mobile) on the preview build. Expected: Performance, Accessibility and Best Practices each 90 or above; fix anything below.
- [ ] **Step 2:** Manual accessibility pass: complete "set up bar → find a drink → make it" using only the keyboard, then with a screen reader; check at 200% text size and with reduced motion on.
- [ ] **Step 3:** Manual browser pass on Chrome, Safari (iOS), Firefox and Edge: age gate, search, bar, making mode, export and import, offline.
- [ ] **Step 4:** Owner action: create a Cloudflare Pages project connected to the repository (build command `npm run build`, output `dist`), enable Web Analytics, create the feedback form and supply its address.
- [ ] **Step 5:** Verify the deployed site: deep links such as `/drinks/negroni` load directly; install works on a phone; the app works offline after one visit.
- [ ] **Step 6:** Owner action: observe 3–5 beginners using the deployed app against the success criteria (a makeable drink within 2 minutes; a recipe followed with no outside lookup). Record problems; fix or defer each one.
- [ ] **Step 7:** Commit: `docs: readme and launch configuration`.
