import { rememberGlass, routeRendered, withViewTransition } from './viewTransition'

afterEach(() => {
  vi.unstubAllGlobals()
  // @ts-expect-error -- removing the test double
  delete document.startViewTransition
  document.body.innerHTML = ''
})

it('navigates straight away where the browser has no view transitions', () => {
  const go = vi.fn()
  withViewTransition(go)
  expect(go).toHaveBeenCalledOnce()
})

it('navigates straight away, without a transition, for anyone who has asked for less motion', () => {
  const start = vi.fn()
  document.startViewTransition = start
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
  const go = vi.fn()
  withViewTransition(go)
  expect(go).toHaveBeenCalledOnce()
  expect(start).not.toHaveBeenCalled()
})

it('holds the old screen until the new one has rendered, then lets the transition run', async () => {
  let update: Promise<void> | undefined
  document.startViewTransition = ((callback: () => Promise<void>) => {
    update = callback()
    return { finished: update, updateCallbackDone: update, ready: update }
  }) as unknown as typeof document.startViewTransition
  let settled = false
  withViewTransition(() => {})
  update!.then(() => (settled = true))
  await Promise.resolve()
  expect(settled).toBe(false)
  routeRendered()
  await update
  expect(settled).toBe(true)
})

it('names the glass that was tapped, and only that one, so it can glide to the drink page', () => {
  document.body.innerHTML = `
    <a><svg class="glass" data-glass="shelf:negroni"></svg></a>
    <a><svg class="glass" data-glass="menu:negroni"></svg></a>`
  const [shelfGlass, menuGlass] = document.querySelectorAll<SVGElement>('.glass')
  menuGlass.style.viewTransitionName = 'drink-glass'
  rememberGlass(shelfGlass.closest('a')!)
  expect(shelfGlass.style.viewTransitionName).toBe('drink-glass')
  expect(menuGlass.style.viewTransitionName).toBe('')
})

it('names the same glass again on the way back, so the drink glides home to where it came from', async () => {
  document.body.innerHTML = '<a><svg class="glass" data-glass="shelf:negroni"></svg></a>'
  rememberGlass(document.querySelector('a')!)
  document.body.innerHTML = `
    <a><svg class="glass" data-glass="menu:negroni"></svg></a>
    <a><svg class="glass" data-glass="shelf:negroni"></svg></a>`
  routeRendered()
  const [menuGlass, shelfGlass] = document.querySelectorAll<SVGElement>('.glass')
  expect(shelfGlass.style.viewTransitionName).toBe('drink-glass')
  expect(menuGlass.style.viewTransitionName).toBe('')
})
