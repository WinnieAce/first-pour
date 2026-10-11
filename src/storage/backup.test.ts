import { backupFileName, parseBackup, serialiseBackup } from './backup'
import type { UserData } from './userData'

const valid: UserData = {
  version: 1,
  ownedIngredientIds: ['gin'],
  favouriteDrinkIds: ['daiquiri'],
  settings: { units: 'oz', ageConfirmed: true },
}

it('round-trips', () => {
  expect(parseBackup(serialiseBackup(valid))).toEqual({ ok: true, data: valid })
})

it.each(['not json', '', '{', 'null', '[]'])('rejects %j as invalid', (text) => {
  expect(parseBackup(text)).toEqual({ ok: false, reason: 'invalid' })
})

it('rejects a newer-version file', () => {
  expect(parseBackup(JSON.stringify({ ...valid, version: 3 }))).toEqual({ ok: false, reason: 'newer-version' })
})

it('removes duplicate ids from an imported file', () => {
  const r = parseBackup(JSON.stringify({ ...valid, ownedIngredientIds: ['gin', 'gin'] }))
  expect(r).toEqual({ ok: true, data: valid })
})

it('names the file by local date', () => {
  expect(backupFileName(new Date(2026, 9, 12, 9))).toBe('first-pour-backup-2026-10-12.json')
  expect(backupFileName(new Date(2027, 0, 3, 23))).toBe('first-pour-backup-2027-01-03.json')
})
