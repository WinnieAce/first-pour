import { parseUserData, type ParseResult, type UserData } from './userData'

export function serialiseBackup(data: UserData): string {
  return JSON.stringify(data, null, 2)
}

export function parseBackup(text: string): ParseResult {
  try {
    return parseUserData(JSON.parse(text))
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}

export function backupFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `first-pour-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}
