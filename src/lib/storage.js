const PREFIX = 'bmc:'

export function readStore(key, seed) {
  const raw = localStorage.getItem(PREFIX + key)
  if (raw === null) {
    localStorage.setItem(PREFIX + key, JSON.stringify(seed))
    return structuredClone(seed)
  }
  try {
    return JSON.parse(raw)
  } catch {
    return structuredClone(seed)
  }
}

export const STORE_CHANGE_EVENT = 'bmc:store-change'

export function writeStore(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
  // Lets badges/counters outside the writing component stay in sync.
  window.dispatchEvent(new CustomEvent(STORE_CHANGE_EVENT, { detail: { key } }))
}

export function clearAllMockData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}
