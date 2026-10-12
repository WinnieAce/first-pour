# First Pour

A free, installable web app that teaches beginners to mix cocktails, starting from the bottles they already own.

- Browse 40 curated drinks, each with a plain-language "why this works".
- Tick the bottles you have to see what you can make now, what you are one ingredient short of, and what to buy next.
- Follow a step-by-step making mode that scales servings and switches between ml and oz.
- Works offline after the first visit. No accounts, no cookies, no personal data.

The design is in [`docs/superpowers/specs`](docs/superpowers/specs) and the build plan in [`docs/superpowers/plans`](docs/superpowers/plans).

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with live reload |
| `npm test` | Runs all tests once |
| `npm run validate-content` | Checks the drink and ingredient files |
| `npm run build` | Validates content, type-checks and builds into `dist` |
| `npm run preview` | Serves the built app, including offline support |
| `npm run lint` | Lints the code |

## How it is organised

| Folder | Responsibility |
| --- | --- |
| `src/content` | Drink and ingredient data, the schema, and build-time validation |
| `src/core` | Pure logic: bar matching, measures, strength, allergens, search |
| `src/storage` | Saving data on the device, backup export and import |
| `src/screens` | One file per screen |
| `src/components` | Pieces shared between screens |

`src/core` knows nothing about screens or storage. Storage sits behind the `UserDataStore` interface in
`src/storage/store.ts`; account sync would be a second implementation of it.

## Add or change a drink

Content lives in two files: `src/content/ingredients.json` and `src/content/drinks.json`. The fields are
defined in `src/content/schema.ts`.

1. If the drink needs a new ingredient, add it to `ingredients.json` with a description, its alcohol
   strength (`abv`), at least two pairings with reasons, and any allergens.
2. Add the drink to `drinks.json`. Give amounts in millilitres. Every ingredient must be mentioned in a step.
3. Run `npm run validate-content` and `npm test`.

Strength, standard drinks and allergen flags are calculated from the ingredients, so they are never typed in
by hand. A malformed entry or a reference to an ingredient that does not exist fails the build.

The light and dark themes and the five colour schemes live in `src/theme/palettes.ts`. A test checks every
palette against WCAG 2.1 AA (4.5:1 for text, 3:1 for field and button edges), so `npm test` fails if a colour
change makes text hard to read.

## Deploy

The app is a folder of static files and can be hosted anywhere. For Cloudflare Pages:

1. Push the repository to GitHub.
2. In Cloudflare Pages, create a project from the repository with build command `npm run build` and
   output directory `dist`.
3. Turn on Web Analytics for the project. It counts page views without cookies.
4. To show the "Send feedback" link, set `FEEDBACK_URL` in `src/config.ts` to the address of your form.

Addresses such as `/drinks/negroni` must fall back to `index.html`. Cloudflare Pages does this automatically
when there is no `404.html`.

## Updates and offline use

After the first visit the whole app is cached on the device. A new version downloads in the background and
takes over only once every tab of the app has been closed, so the app never changes under someone in the
middle of a recipe.
