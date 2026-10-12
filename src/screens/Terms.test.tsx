import { screen } from '@testing-library/react'
import App from '../App'
import { confirmed, renderApp } from '../test/render'

const feedback = vi.hoisted(() => ({ url: '' }))
vi.mock('../config', () => ({
  APP_NAME: 'First Pour',
  get FEEDBACK_URL() {
    return feedback.url
  },
}))

const open = async () => {
  renderApp(<App />, { data: confirmed(), route: '/terms' })
  await screen.findByRole('heading', { level: 1, name: 'Terms and privacy' })
}

afterEach(() => {
  feedback.url = ''
})

it('says the feedback form is run by Google when there is one', async () => {
  feedback.url = 'https://example.com/form'
  await open()
  expect(screen.getByText(/feedback form is run by Google/i)).toBeInTheDocument()
})

it('does not mention a feedback form when there is none', async () => {
  await open()
  expect(screen.queryByText(/feedback form/i)).not.toBeInTheDocument()
})
