import { useEffect } from 'react'

type Lock = { release(): Promise<void> }
type WakeLockApi = { request(type: 'screen'): Promise<Lock> }

/** Keeps the screen awake while `active`. Does nothing where the browser cannot or will not do it. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock
    if (!active || !api) return

    let lock: Lock | null = null
    let stopped = false

    const acquire = () => {
      api.request('screen').then(
        (granted) => {
          if (stopped) void granted.release().catch(() => {})
          else lock = granted
        },
        () => {
          // Refused, for example in battery saver mode. The recipe still works; the screen may dim.
        },
      )
    }
    // Browsers release the lock whenever the page is hidden, so ask again on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => {})
    }
  }, [active])
}
