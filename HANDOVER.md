# Handover

Notes for anyone, person or AI, starting a new app from First Pour. The code shows what was built; this
file records why, and what was learned along the way. Read it with the README and the original spec and
plan in `docs/superpowers/`.

The first planned spin-off is a separate app for a general audience including minors: non-alcoholic
drinks only, with café-style drinks and Singapore kopitiam drinks (Kopi O, Kopi O Kosong, Teh Beng and
so on). Section 6 is written for that app.

## 1. What to reuse, what to leave behind

First Pour has two layers. The engine is general and worth reusing. The visual identity belongs to First
Pour and should not be carried over: the new app gets its own look, designed with the owner.

**Reuse (adapt names and fields as needed)**

| Area | Where | What it does |
|---|---|---|
| Content | `src/content/` | Drinks and ingredients as JSON, a Zod schema, and validation that fails the build on a bad entry or a broken reference |
| Core logic | `src/core/` | Pure functions: "what can I make" matching with substitutes, measure scaling and ml/oz, search, allergens, the daily shelf, swipe decisions, glass garnish rules |
| Storage | `src/storage/` | Saved data on the device (IndexedDB), versioned with migrations, plus backup export and import |
| Themes | `src/theme/` | Light, dark and device themes with several colour schemes, applied as CSS variables, and a test that checks every palette's contrast |
| Motion | `src/hooks/` | The swipeable shelf spring, loops that rest after five seconds, view transitions from list to detail, the screen wake lock |
| Components | `src/components/` | The animated glass drawing, links that glide their glass into the next screen, drawn icons, the menu line, the layout with its floating nav |
| Screens | `src/screens/` | Library, drink page, ingredient page, My bar, making mode, favourites, settings |

**Leave behind**

- The age gate, responsible-drinking notices, alcohol strength and standard drinks (`AgeGate`,
  `ResponsibleNotice`, `core/strength.ts`, the `abv` field). The terms page text is about alcohol.
- The visual identity: the five dark-academia colour schemes, Cormorant Garamond and Instrument Sans,
  the "bar menu" metaphor with dotted leaders, the arched shelf tiles. These were chosen for a cocktail
  app at night. Keep the *ideas* in section 3 (restraint, no boxes everywhere, one signature motion
  moment) and apply them to a new look.
- The glass shapes in `GlassIcon.tsx` are cocktail glassware. Kopitiam and café drinks need their own
  drawings (cups with saucers, glass mugs, the plastic takeaway bag with a string, and so on).

## 2. How the code is organised

- `src/core` knows nothing about screens or storage, so it is easy to test and to reuse.
- Content is data, not code. Strength, allergens, garnishes and the shelf are all calculated from the
  recipe, so nothing is typed in twice. Content tests in `src/content/content.test.ts` guard the
  library: every ingredient appears in a step, every bottle has two pairings, raw egg carries a caution,
  substitutes are of similar strength, and so on. Write equivalent guards for the new content.
- Tests run in jsdom. It has no `startViewTransition` and no `matchMedia`; the code checks for both.
  `src/test/setup.ts` sets `MotionGlobalConfig.skipAnimations` so Motion settles instantly in tests.

## 3. Design and motion principles that held up

These came from three design passes (Impeccable, Emil Kowalski's design-engineering rules, Apple's
interface guidelines) and from watching real people use the app.

**Layout and type**
- Phone first; every tap target at least 44 by 44 pixels.
- Contrast to WCAG AA in every theme, enforced by `src/theme/palettes.test.ts`. Keep that test; it
  caught palettes taken straight from inspiration boards that were too faint to read.
- Avoid boxes around everything. Use spacing, type and a few filled shapes for the things that matter.
- No thick coloured bars down the side of quotes or notes; no emoji or symbol characters as icons (use
  the drawn icons); theme the text selection, cursor and scrollbars.
- Large display type reads better slightly tightened (about -0.012em to -0.015em).
- Self-host fonts, so they work offline and nothing is fetched from a third party.

**Motion**
- One signature moment per screen, not effects everywhere. A list of many items stays still.
- Press feedback on everything pressable (scale to 0.97). Hover effects only for a real mouse.
- Looping animation stops after five seconds and wakes on touch (WCAG 2.2.2). Off-screen items pause.
- Springs are timed in seconds, not frames, so they behave the same on 60 Hz and 120 Hz phones.
  Critically damped by default; a little bounce only after a gesture with momentum, such as a swipe.
- Tapping an item glides its drawing into the detail screen and back (`hooks/viewTransition.ts`).
- Respect "reduce motion": Motion runs with `reducedMotion="user"` and view transitions are skipped.
- Motion (Framer Motion) is used only where it earns its 145 KB: swiping between steps in making mode.
  Everything else is CSS or a few lines of our own.
- Do not use Motion's shared-layout animation (`layoutId`) inside a pinned (`position: fixed`) bar. It
  measures against the page's scroll position, so after scrolling, the nav highlight flew in diagonally
  from where the page had been. The highlight is now one element slid sideways with a CSS transform.

## 4. What testers taught us

- **An installed app has no browser back button.** Every inner page needs its own Back.
- **Keep the main result in reach.** A long checklist pushed "What I can make" off screen; it is now
  pinned at the top while the list scrolls.
- **Local drinks matter.** Testers asked for Singapore drinks first.
- **Freshness brings people back.** A tester asked for a shelf that changes daily; it now rotates its
  suggestions at midnight while keeping favourites first.
- **Swipe areas must fill the space,** not just the words, or swipes on empty space do nothing.
- **Counters need a fixed width.** "1 serving" to "8 servings" grew and pushed nearby buttons onto a new
  line on a 360-pixel phone. Check at 360 and 375 pixels wide.

## 5. How the work was done

- Brainstorm and agree the design before building. For visual changes, show a mock-up first.
- Tests first, then the code. `npm test`, `npm run lint` and `npm run build` must pass before a commit.
- Check every visual change in the browser at phone width and on desktop.
- Commit locally; push only when the owner says so.
- Feedback lives in `docs/feedback.md`, which never goes to GitHub (`.git/info/exclude`). Testers'
  names stay there and nowhere else.
- Hosting: Cloudflare (Workers, static assets) building from GitHub on every push. The `workers.dev`
  address had to be switched on by hand. Direct links work without extra setup. Add a `robots.txt`.
- Lighthouse on the live site scored 99 / 100 / 100 / 91 before `robots.txt` was added.

**Local gotchas on this Windows machine**
- In `.claude/launch.json`, use `"runtimeExecutable": "node"`; a Windows path with backslashes breaks.
- Long inline Python heredocs containing apostrophes fail in this shell; write the script to a file.

## 6. Starting points for the non-alcoholic kopitiam and café app

- **Audience includes minors.** No age gate, but no alcohol anywhere, including hidden sources:
  Angostura bitters, vanilla extract and some syrups contain alcohol.
- **Caffeine replaces alcohol strength.** Show a caffeine level per drink and make caffeine-free drinks
  easy to find (Milo, Horlicks, Bandung, barley, chrysanthemum tea).
- **Allergens:** dairy is everywhere (condensed and evaporated milk). Add soy to the allergen list.
- **Privacy for minors:** keep no accounts and no personal data. A feedback form must not collect names
  or email addresses.
- **Teach the ordering language.** Kopitiam terms are a vocabulary of their own: O (no milk), C
  (evaporated milk), Kosong (no sugar), Siew Dai (less sugar), Ga Dai (more sugar), Peng or Beng (iced),
  Gau (strong), Po (weak). An order builder that turns choices into the right name would do for this app
  what "what pairs with what" does for First Pour.
- **Recipes to recover:** Bandung was removed from First Pour but is in its history. Run
  `git show 13ee70b:src/content/drinks.json` to see it. First Pour's Milo Nightcap and Iced Kopi Cocktail
  contain alcohol, but their alcohol-free bases (iced Milo, kopi with condensed milk) carry over.
- **Look:** a cosy café feel with its own colour schemes, fonts and drawings, decided with the owner
  during brainstorming. Do not reuse First Pour's palettes.
