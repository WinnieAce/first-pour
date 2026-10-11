import { renderHook, waitFor } from '@testing-library/react'
import { useWakeLock } from './useWakeLock'

const install = (request: unknown) =>
  Object.defineProperty(navigator, 'wakeLock', { value: request ? { request } : undefined, configurable: true })

afterEach(() => {
  Reflect.deleteProperty(navigator, 'wakeLock')
})

it('requests a screen lock when active and releases it on unmount', async () => {
  const release = vi.fn().mockResolvedValue(undefined)
  const request = vi.fn().mockResolvedValue({ release })
  install(request)
  const { unmount } = renderHook(() => useWakeLock(true))
  await waitFor(() => expect(request).toHaveBeenCalledWith('screen'))
  unmount()
  await waitFor(() => expect(release).toHaveBeenCalledTimes(1))
})

it('does not request a lock when inactive', () => {
  const request = vi.fn()
  install(request)
  renderHook(() => useWakeLock(false))
  expect(request).not.toHaveBeenCalled()
})

it('asks again when the page becomes visible, because browsers drop the lock when hidden', async () => {
  const request = vi.fn().mockResolvedValue({ release: vi.fn().mockResolvedValue(undefined) })
  install(request)
  renderHook(() => useWakeLock(true))
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1))
  document.dispatchEvent(new Event('visibilitychange'))
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
})

it('does nothing when the browser has no wake lock support', () => {
  install(undefined)
  expect(() => renderHook(() => useWakeLock(true)).unmount()).not.toThrow()
})

it('swallows a rejected request', async () => {
  const request = vi.fn().mockRejectedValue(new Error('battery saver'))
  install(request)
  const { unmount } = renderHook(() => useWakeLock(true))
  await waitFor(() => expect(request).toHaveBeenCalled())
  expect(() => unmount()).not.toThrow()
})
