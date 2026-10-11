import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsibleNotice } from '../components/ResponsibleNotice'
import { APP_NAME } from '../config'
import { useUserData } from '../storage/UserDataContext'

export function AgeGate() {
  const { confirmAge } = useUserData()
  const [declined, setDeclined] = useState(false)

  return (
    <main className="gate">
      <h1 className="brand">{APP_NAME}</h1>
      {declined ? (
        <p>This app is about alcoholic drinks. Come back when you are of legal drinking age.</p>
      ) : (
        <>
          <p>Learn to mix cocktails, starting from the bottles you already own.</p>
          <h2>Are you of legal drinking age in your country?</h2>
          <div className="row">
            <button className="button primary" onClick={confirmAge}>
              Yes, I am
            </button>
            <button className="button" onClick={() => setDeclined(true)}>
              No
            </button>
          </div>
        </>
      )}
      <ResponsibleNotice />
      <p>
        <Link to="/terms">Terms and privacy</Link>
      </p>
    </main>
  )
}
