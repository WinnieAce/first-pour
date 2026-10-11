import { Link } from 'react-router-dom'

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="stack">
      <h1>We couldn't find that {what}</h1>
      <p>It may have been renamed or removed.</p>
      <p>
        <Link to="/">Back to all drinks</Link>
      </p>
    </div>
  )
}
