import { Link } from 'react-router-dom'
import { ResponsibleNotice } from '../components/ResponsibleNotice'
import { APP_NAME } from '../config'

export function Terms() {
  return (
    <article className="stack prose">
      <h1>Terms and privacy</h1>

      <h2>Your privacy</h2>
      <p>
        {APP_NAME} has no accounts and uses no cookies. No personal data is collected. Your bar, favourites and settings
        are saved only on this device, in this browser, and are never sent anywhere.
      </p>
      <p>
        Clearing this browser's data erases them. You can keep a copy with the backup option in Settings. The site counts
        page views without cookies and without identifying you.
      </p>

      <h2>Using the app</h2>
      <p>
        {APP_NAME} is for adults of legal drinking age in their country. The recipes and the strength figures are
        guidance only: strength is an estimate, and the definition of a standard drink varies by country.
      </p>
      <p>
        Allergen notes cover the usual ingredients. Check the label of the bottle you actually use, because brands
        differ.
      </p>
      <ResponsibleNotice />

      <p>
        <Link to="/">Back to all drinks</Link>
      </p>
    </article>
  )
}
