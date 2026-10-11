import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME, FEEDBACK_URL } from '../config'
import { useContent } from '../content/ContentContext'
import { backupFileName, parseBackup, serialiseBackup } from '../storage/backup'
import { pruneUnknownIds, type UserData } from '../storage/userData'
import { useUserData } from '../storage/UserDataContext'

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function Settings() {
  const { content } = useContent()
  const { data, setUnits, replaceAll } = useUserData()
  const [pending, setPending] = useState<UserData | null>(null)
  const [error, setError] = useState('')
  const [restored, setRestored] = useState(false)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pending) cancelButton.current?.focus()
  }, [pending])

  const exportBackup = () => {
    const url = URL.createObjectURL(new Blob([serialiseBackup(data)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName(new Date())
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    setError('')
    setRestored(false)
    setPending(null)

    const text = await file.text().catch(() => '')
    // Clear the input so choosing the same file again still triggers a change.
    input.value = ''
    const parsed = parseBackup(text)
    if (parsed.ok) setPending(pruneUnknownIds(parsed.data, content))
    else if (parsed.reason === 'newer-version')
      setError('This backup is from a newer version of the app. Reload to update the app, then try again.')
    else setError(`That file isn't a ${APP_NAME} backup. Choose a file you exported from this app.`)
  }

  const closeDialog = () => {
    setPending(null)
    importInput.current?.focus()
  }

  const confirmImport = () => {
    if (!pending) return
    replaceAll(pending)
    setRestored(true)
    closeDialog()
  }

  return (
    <div className="stack">
      <h1>Settings</h1>

      <section className="section">
        <fieldset className="group">
          <legend>Measurements</legend>
          {(
            [
              ['ml', 'Millilitres (ml)'],
              ['oz', 'Ounces (oz)'],
            ] as const
          ).map(([units, label]) => (
            <div key={units} className="check">
              <input
                id={`units-${units}`}
                type="radio"
                name="units"
                checked={data.settings.units === units}
                onChange={() => setUnits(units)}
              />
              <label htmlFor={`units-${units}`}>{label}</label>
            </div>
          ))}
        </fieldset>
      </section>

      <section className="section">
        <h2>Backup</h2>
        <p>
          Your bar and favourites are saved only on this device. Clearing this browser's data erases them, so export a
          backup now and then.
        </p>
        <div className="row">
          <button className="button" onClick={exportBackup}>
            Export a backup
          </button>
          <label className="button">
            Import a backup
            <input
              ref={importInput}
              type="file"
              accept=".json,application/json"
              className="visually-hidden"
              onChange={importBackup}
            />
          </label>
        </div>

        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        {/* Always present, so screen readers announce the text when it appears. */}
        <p className={restored ? 'badge good' : undefined} role="status">
          {restored && 'Backup restored.'}
        </p>
        {pending && (
          <div
            className="dialog stack-sm"
            role="alertdialog"
            aria-labelledby="import-title"
            aria-describedby="import-text"
            onKeyDown={(e) => e.key === 'Escape' && closeDialog()}
          >
            <h3 id="import-title">Replace your bar and favourites?</h3>
            <p id="import-text">
              This backup has {count(pending.ownedIngredientIds.length, 'ingredient', 'ingredients')} and{' '}
              {count(pending.favouriteDrinkIds.length, 'favourite', 'favourites')}. It will replace what is saved on this
              device.
            </p>
            <div className="row">
              <button className="button primary" onClick={confirmImport}>
                Replace my data
              </button>
              <button className="button" ref={cancelButton} onClick={closeDialog}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="section">
        <h2>About</h2>
        <p>{APP_NAME} is free, has no accounts and collects no personal data.</p>
        <div className="row">
          <Link to="/terms">Terms and privacy</Link>
          {FEEDBACK_URL && (
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
              Send feedback
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
