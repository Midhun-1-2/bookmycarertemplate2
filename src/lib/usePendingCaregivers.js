import { useEffect, useState } from 'react'
import { staffApi } from './mockApi'
import { STORE_CHANGE_EVENT } from './storage'

/**
 * Caregivers who have self-registered and are waiting on Admin approval.
 * Re-reads whenever any collection is written, so approval counts shown outside
 * the page doing the approving (e.g. the sidebar badge) stay accurate.
 */
export function usePendingCaregivers() {
  const [pending, setPending] = useState(() => staffApi.listSync().filter((s) => s.status === 'pending'))

  useEffect(() => {
    function refresh() {
      setPending(staffApi.listSync().filter((s) => s.status === 'pending'))
    }
    refresh()
    window.addEventListener(STORE_CHANGE_EVENT, refresh)
    return () => window.removeEventListener(STORE_CHANGE_EVENT, refresh)
  }, [])

  return pending
}
