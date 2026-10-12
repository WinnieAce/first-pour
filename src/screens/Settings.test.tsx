import { screen, within } from '@testing-library/react'
import App from '../App'
import { serialiseBackup } from '../storage/backup'
import { confirmed, renderApp } from '../test/render'

const feedback = vi.hoisted(() => ({ url: '' }))
vi.mock('../config', () => ({
  APP_NAME: 'First Pour',
  get FEEDBACK_URL() {
    return feedback.url
  },
}))

const mine = confirmed({ ownedIngredientIds: ['gin'], favouriteDrinkIds: ['daiquiri'] })
const theirs = confirmed({ ownedIngredientIds: ['bourbon', 'rye'], favouriteDrinkIds: ['old-fashioned'], units: 'oz' })

const open = async () => {
  const view = renderApp(<App />, { data: mine, route: '/settings' })
  await screen.findByRole('heading', { level: 1, name: 'Settings' })
  return view
}
const upload = (user: Awaited<ReturnType<typeof open>>['user'], text: string) =>
  user.upload(screen.getByLabelText(/import a backup/i), new File([text], 'backup.json', { type: 'application/json' }))

afterEach(() => {
  feedback.url = ''
  vi.restoreAllMocks()
})

it('switches units and saves', async () => {
  const { user, store } = await open()
  expect(screen.getByRole('radio', { name: /millilitres/i })).toBeChecked()
  await user.click(screen.getByRole('radio', { name: /ounces/i }))
  expect(screen.getByRole('radio', { name: /ounces/i })).toBeChecked()
  expect((await store.load())!.settings.units).toBe('oz')
})

it('export downloads the saved data as a JSON file named by date', async () => {
  let exported: Blob | undefined
  URL.createObjectURL = vi.fn((blob: Blob) => {
    exported = blob
    return 'blob:backup'
  })
  URL.revokeObjectURL = vi.fn()
  let download = ''
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    download = this.download
  })

  const { user } = await open()
  await user.click(screen.getByRole('button', { name: /export a backup/i }))

  expect(download).toMatch(/^first-pour-backup-\d{4}-\d{2}-\d{2}\.json$/)
  expect(JSON.parse(await exported!.text())).toEqual(mine)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:backup')
})

it('importing a valid file asks for confirmation, then replaces data', async () => {
  const { user, store } = await open()
  await upload(user, serialiseBackup(theirs))
  expect(await screen.findByRole('alertdialog')).toHaveTextContent(/2 ingredients and 1 favourite/i)
  expect((await store.load())!.ownedIngredientIds).toEqual(['gin'])

  await user.click(screen.getByRole('button', { name: /replace my data/i }))
  expect(await store.load()).toEqual(theirs)
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(screen.getByText(/backup restored/i)).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: /ounces/i })).toBeChecked()
})

it('cancelling the confirmation leaves data untouched', async () => {
  const { user, store } = await open()
  await upload(user, serialiseBackup(theirs))
  await user.click(await screen.findByRole('button', { name: /cancel/i }))
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(await store.load()).toEqual(mine)
})

it.each(['not json at all', '{"hello":"world"}', ''])('rejects the invalid file %j and leaves data untouched', async (text) => {
  const { user, store } = await open()
  await upload(user, text)
  expect(await screen.findByRole('alert')).toHaveTextContent("That file isn't a First Pour backup")
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(await store.load()).toEqual(mine)
})

it('explains when a backup is from a newer version', async () => {
  const { user, store } = await open()
  await upload(user, JSON.stringify({ ...theirs, version: 2 }))
  expect(await screen.findByRole('alert')).toHaveTextContent('This backup is from a newer version of the app')
  expect(await store.load()).toEqual(mine)
})

it('import drops ids that are not in the content', async () => {
  const { user, store } = await open()
  await upload(user, serialiseBackup({ ...theirs, ownedIngredientIds: ['bourbon', 'unobtainium'], favouriteDrinkIds: ['gone'] }))
  expect(await screen.findByRole('alertdialog')).toHaveTextContent(/1 ingredient and 0 favourites/i)
  await user.click(screen.getByRole('button', { name: /replace my data/i }))
  const saved = (await store.load())!
  expect(saved.ownedIngredientIds).toEqual(['bourbon'])
  expect(saved.favouriteDrinkIds).toEqual([])
})

it('the same file can be chosen again after cancelling', async () => {
  const { user } = await open()
  await upload(user, serialiseBackup(theirs))
  await user.click(await screen.findByRole('button', { name: /cancel/i }))
  await upload(user, serialiseBackup(theirs))
  expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
})

it('reminds the user that clearing browser data erases their bar', async () => {
  await open()
  expect(screen.getByText(/clearing this browser's data erases/i)).toBeInTheDocument()
})

it('hides the feedback link while no address is set', async () => {
  await open()
  expect(screen.queryByRole('link', { name: /send feedback/i })).not.toBeInTheDocument()
})

it('shows the feedback link when an address is set', async () => {
  feedback.url = 'https://example.com/form'
  await open()
  const links = screen.getAllByRole('link', { name: /send feedback/i })
  expect(links).toHaveLength(2)
  for (const link of links) {
    expect(link).toHaveAttribute('href', 'https://example.com/form')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  }
})

it('returns focus to the import control after cancelling', async () => {
  const { user } = await open()
  await upload(user, serialiseBackup(theirs))
  await user.click(await screen.findByRole('button', { name: /cancel/i }))
  expect(screen.getByLabelText(/import a backup/i)).toHaveFocus()
})

it('Escape closes the confirmation without changing data', async () => {
  const { user, store } = await open()
  await upload(user, serialiseBackup(theirs))
  await screen.findByRole('alertdialog')
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(await store.load()).toEqual(mine)
  expect(screen.getByLabelText(/import a backup/i)).toHaveFocus()
})

it('announces the restore through a status region that exists beforehand', async () => {
  const { user } = await open()
  const status = within(screen.getByRole('heading', { name: 'Backup' }).closest('section')!).getByRole('status')
  expect(status).toBeEmptyDOMElement()
  await upload(user, serialiseBackup(theirs))
  await user.click(await screen.findByRole('button', { name: /replace my data/i }))
  expect(status).toHaveTextContent(/backup restored/i)
  expect(screen.getByLabelText(/import a backup/i)).toHaveFocus()
})

it('links to terms and privacy once, not in both the page and the footer', async () => {
  await open()
  expect(screen.getAllByRole('link', { name: /terms and privacy/i })).toHaveLength(1)
})
