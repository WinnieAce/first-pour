# Drinks mixing app — design spec

Date: 2026-10-12
Status: awaiting review

## 1. Purpose

A free, installable web app that teaches beginners to mix cocktails, starting
from the bottles they already own.

**Target user.** Someone comfortable drinking spirits neat who has a few
favourite cocktails but has never mixed one. They know their bottles, not the
vocabulary or technique of mixing.

**Outcome.** The user learns what goes well with what, and why, by browsing and
making drinks. Learning is woven into every recipe and ingredient page; there
are no lessons or courses.

**Release.** A small public release, free to use, with no accounts.

## 2. Success criteria

1. A beginner can go from opening the app for the first time to a drink they
   can make with their own bottles in under 2 minutes.
2. A beginner can follow a recipe to the end without looking anything up
   elsewhere.
3. Before public launch, 3–5 real beginners have used a working build while
   being observed, and the problems they hit have been fixed or consciously
   deferred.

## 3. Scope

### In the first release

1. **Drink library**
2. **Ingredient pages**
3. **My bar**
4. **Making mode**
5. **Favourites and backup**
6. **Age gate and responsibility information**
7. **Feedback link and cookie-free usage counts**

### Not in the first release

- Accounts and sync across devices (phase 2).
- A wider public recipe database such as TheCocktailDB (phase 2 or later).
- A "start here" trail of suggested first drinks.
- User-submitted recipes, ratings, sharing.
- Native app store versions.
- Drink photographs (see 5.1).

## 4. Features

### 4.1 Drink library

- Lists all curated drinks. Launch target: 40 drinks, of which at least 5 are
  low- or no-alcohol.
- Search by drink name and by ingredient name.
- Filter by base spirit, drink family, flavour (sweet, sour, bitter, strong)
  and difficulty (easy, medium, harder).
- A toggle limits the list to drinks the user can make with their bar.

Each drink page shows:

- Ingredients with measures, steps, glass, and tools with alternatives.
- "Why this works": a short plain-language explanation of the drink's balance.
- Its drink family (for example sour, highball, stirred and strong) with a
  one-line description of the family and links to its other members.
- Substitutions that are acceptable for each ingredient.
- Calculated strength, grams of alcohol, approximate standard drinks, and
  allergen flags (see 6.3 and 6.4).
- Which of the ingredients the user owns, and which are missing.
- Buttons to favourite the drink and to start making mode.

### 4.2 Ingredient pages

One page per spirit, liqueur, mixer and fresh ingredient, showing:

- What it tastes like, in plain language.
- What it pairs with, as links to other ingredients, with a short reason.
- Every drink in the library that uses it.
- Acceptable substitutes.
- A control to add it to or remove it from the user's bar.

### 4.3 My bar

- The user ticks the ingredients they own. A quick-pick section at the top
  lists the most common bottles so setup takes seconds.
- Staples (ice, water, sugar, salt) are treated as owned by default. The user
  can untick them.
- Three result groups, calculated by the rules in 6.1:
  - **Can make now**
  - **One ingredient short**, naming the missing ingredient
  - **Best next purchase**: the ingredients that would unlock the most new
    drinks, ranked

### 4.4 Making mode

- One step per screen with large text, next and back controls, and the
  ingredients for that step shown with their measures.
- The screen stays awake using the Screen Wake Lock API. Where the browser does
  not support it, making mode works normally without it.
- Servings can be set from 1 to 8; all measures scale.
- Measures show in ml or oz according to the user's setting, switchable from
  within making mode.
- Technique steps (shake, stir, muddle, strain) carry a short explanation of
  what to do and why, and what to use if the user lacks the tool.

### 4.5 Favourites and backup

- Any drink can be favourited; favourites have their own list.
- Settings offers **Export**, which downloads a JSON backup file, and
  **Import**, which restores from one.

### 4.6 Age gate and responsibility

- On first visit the user must confirm they are of legal drinking age in their
  country. The confirmation is saved; they are not asked again.
- If they decline, the app shows a short message and no drink content.
- A responsible-drinking notice appears on the age gate and in the footer of
  every drink page.
- No content encourages excessive or rapid drinking.
- A terms and privacy page states that no personal data is collected.

### 4.7 Feedback and usage counts

- A "Send feedback" link in settings and the footer opens an external feedback
  form. The form address is held in one configuration value.
- Page-view counts come from Cloudflare Web Analytics, which sets no cookies
  and collects no personal data.

## 5. Content

### 5.1 Principles

- All text is original writing for this app.
- No photographs in the first release. Each drink shows a simple illustration
  of its glass type, drawn for the app as SVG. This avoids image licensing
  and keeps the offline download small.
- Plain language. Any bar term is explained where it first appears on a page.

### 5.2 Ingredient record

| Field | Notes |
|---|---|
| `id` | Unique, lowercase with hyphens |
| `name` | Display name |
| `category` | `spirit`, `liqueur`, `wine-or-fortified`, `bitters`, `mixer`, `fresh`, `staple` |
| `description` | What it tastes like |
| `abv` | Alcohol by volume as a percentage; 0 for non-alcoholic |
| `pairsWith` | List of `{ ingredientId, reason }` |
| `substitutes` | List of ingredient ids acceptable in its place |
| `allergens` | Any of `egg`, `dairy`, `nuts`, `gluten`, `sulphites` |
| `common` | True if it appears in the quick-pick list |

### 5.3 Drink record

| Field | Notes |
|---|---|
| `id` | Unique, lowercase with hyphens |
| `name` | Display name |
| `family` | One of a fixed list of drink families |
| `baseIngredientId` | The base spirit, or none for no-alcohol drinks |
| `flavour` | One or more of `sweet`, `sour`, `bitter`, `strong` |
| `difficulty` | `easy`, `medium`, `harder` |
| `method` | `shaken`, `stirred`, `built`, `blended` |
| `ingredients` | List of `{ ingredientId, amount, unit, optional, note }` |
| `steps` | Ordered list of `{ text, technique, ingredientIds }` |
| `glass` | One of a fixed list of glass types |
| `tools` | List of `{ name, alternative }` |
| `whyItWorks` | The explanation text |

`unit` is one of `ml`, `dash`, `barspoon`, `piece`. Substitutes are defined on
the ingredient, not repeated per drink. Substitution is one level only: owning
a substitute of a substitute does not count.

Drink families: `sour`, `highball`, `collins-and-fizz`, `stirred-and-strong`,
`spritz-and-sparkling`, `tropical`, `coffee-and-cream`.

Glass types: `rocks`, `highball`, `coupe`, `martini`, `wine`, `flute`, `mug`.

### 5.4 Validation

Content is checked at build time. The build fails if any record is malformed,
any id is duplicated, or any reference (ingredient, substitute, pairing, base)
points to an id that does not exist.

## 6. Core logic rules

### 6.1 Matching

- An ingredient is **available** if the user owns it or owns one of its
  listed substitutes.
- A drink is **makeable** if every non-optional ingredient is available.
- A drink is **one short** if exactly one non-optional ingredient is not
  available.
- **Best next purchase** scores each unowned ingredient by the number of
  drinks that would become makeable if it were added. Ties are broken by the
  number of library drinks that use the ingredient, then by name. Ingredients
  scoring zero are not shown.

### 6.2 Scaling and units

- All volumes are stored in ml.
- Scaling multiplies every amount by the number of servings.
- Ounces are displayed using the bar convention of 1 oz = 30 ml, rounded to
  the nearest quarter ounce.
- Millilitres are displayed rounded to the nearest 2.5 ml below 30 ml, and to
  the nearest 5 ml from 30 ml up, so common bar measures such as 22.5 ml
  survive unchanged.
- A non-zero amount never displays as zero: the smallest shown is 2.5 ml or
  a quarter ounce.
- `dash`, `barspoon` and `piece` amounts scale but are not converted.

### 6.3 Strength

- Alcohol volume = sum of (amount in ml × abv) across ingredients measured
  in ml. Dashes, barspoons, pieces and optional ingredients are ignored.
- A drink with no measured volume shows a strength of 0%.
- Final volume = total ingredient volume plus dilution: 25% for shaken and
  blended, 20% for stirred, 10% for built.
- Strength = alcohol volume ÷ final volume, shown as a whole percentage.
- Grams of alcohol = alcohol volume in ml × 0.789.
- Standard drinks = grams ÷ 10, shown to one decimal place and labelled
  "approximate", with a note that the definition varies by country.

### 6.4 Allergens

A drink's allergen flags are the union of its ingredients' allergens,
including optional ingredients.

## 7. Technical design

### 7.1 Approach

A static web app with the content bundled in. All logic runs in the browser.
There is no server and no database. The built files are served from a static
host.

Rejected alternatives: a headless content management system (extra dependency
for a library one person maintains), and a backend from day one (running cost
and maintenance before any feature needs it, and harder offline use).

### 7.2 Parts

| Part | Responsibility | Depends on |
|---|---|---|
| Content | Drink and ingredient data files, schema, build-time validation | Nothing |
| Core logic | Matching, scaling, unit conversion, strength, allergens | Content types |
| Storage | Load and save user data; export, import, version migration | Nothing |
| Screens | Library, drink, ingredient, my bar, making mode, favourites, settings, age gate, terms | Core logic, storage |
| App shell | Routing, install support, offline caching, background updates | Screens |

Core logic is pure functions with no knowledge of screens or storage. Storage
is one interface with a single on-device implementation; phase 2 adds a
syncing implementation behind the same interface.

### 7.3 Saved user data

```
{
  version: 1,
  ownedIngredientIds: string[],
  favouriteDrinkIds: string[],
  settings: { units: "ml" | "oz", ageConfirmed: boolean }
}
```

Stored in IndexedDB. On first run, staples are added to `ownedIngredientIds`
and `units` defaults to ml. The export file is this object as JSON.

### 7.4 Tools

- TypeScript, React, Vite.
- Vite PWA plugin for the service worker, offline caching and install prompt.
- Zod for the content schema and for checking imported backup files.
- Vitest for automated tests.
- Cloudflare Pages for hosting; Cloudflare Web Analytics for usage counts.

## 8. Error handling

- **Storage unavailable** (for example some private browsing modes): the app
  works for the session, and a notice explains that changes will not be saved.
- **Saved data refers to an id no longer in the content:** the id is ignored
  and removed on the next save.
- **Saved data is from an older version:** it is migrated on load.
- **Import file is invalid or from a newer version:** the import is rejected
  with a clear message and existing data is left untouched.
- **Import of a valid file:** the user confirms before it replaces their data.
- **Offline on the very first visit:** the browser's own offline page appears;
  nothing can be done until the app has loaded once.
- **Unknown address:** a not-found screen links back to the library.

## 9. Non-functional requirements

**Performance**
- First screen usable within 2 seconds on a mid-range phone on a 4G
  connection.
- Search and bar matching respond in under 100 ms.

**Offline and reliability**
- After the first visit, every feature except the feedback link works with no
  connection.
- Updates download in the background and apply the next time the app is
  opened, never mid-session.

**Usability**
- Designed for phones first. Tap targets are at least 44 by 44 CSS pixels.
- Making mode is readable at arm's length and usable one-handed.

**Accessibility**
- Meets WCAG 2.1 AA: contrast, screen reader labels, keyboard navigation.
- Respects the device's text size and reduced-motion settings.

**Privacy**
- No personal data collected. No cookies. Nothing the user enters leaves the
  device.

**Legal**
- Age confirmation, responsible-drinking notice, terms and privacy page.
- All text and illustrations are original to the app.

**Maintainability**
- Content is separate from code and validated at build time.
- Core logic and storage are covered by automated tests.
- Saved data is versioned.

**Cost and compatibility**
- No running cost at launch.
- Works on the current and previous major versions of Chrome, Safari, Firefox
  and Edge, on phones and desktops.

## 10. Testing

- **Core logic:** unit tests for matching (including substitutes, optional
  ingredients, staples and tie-breaking), scaling, rounding, unit conversion,
  strength and allergens.
- **Storage:** tests for save and load, migration, export and import, and
  rejection of invalid files.
- **Content:** the validation in 5.4 runs on every build.
- **Screens:** component tests for the age gate, the my-bar flow and making
  mode navigation.
- **Quality checks:** Lighthouse for performance, accessibility and
  installability before launch.
- **People:** the observed beginner sessions in success criterion 3.

## 11. Risks

| Risk | Response |
|---|---|
| Setting up the bar feels tedious | Quick-pick of common bottles; staples pre-ticked |
| Explanations are bland or inaccurate | Content is drafted, then reviewed by the owner drink by drink before launch |
| Users lose data by clearing the browser | Export and import; a reminder in settings |
| No way to know how the app is used | Cookie-free page counts and the feedback form |

## 12. Later phases

- **Phase 2:** optional accounts with sync, added as a second storage
  implementation. This brings a hosted backend, a fuller privacy policy, and
  account deletion and data export.
- **Later:** the wider recipe database, shown separately from curated
  content; a "start here" trail; packaging for app stores.
