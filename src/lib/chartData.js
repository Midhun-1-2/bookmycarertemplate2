import { STATUS_LABEL } from './bookingStatus'

const DAY_MS = 24 * 60 * 60 * 1000

export function revenueByDay(bookings, days = 14) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today.getTime() - i * DAY_MS)
    buckets.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: 0,
      bookings: 0,
    })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))

  bookings.forEach((b) => {
    const key = (b.createdAt || b.startDate || '').slice(0, 10)
    const bucket = byKey[key]
    if (!bucket) return
    bucket.bookings += 1
    if (b.payment?.status === 'paid') bucket.revenue += b.payment.amount
  })

  return buckets
}

export function bookingsByCategory(bookings, categories) {
  const counts = {}
  bookings.forEach((b) => {
    counts[b.categoryId] = (counts[b.categoryId] || 0) + 1
  })
  return categories
    .map((cat) => ({ name: cat.name, value: counts[cat.id] || 0 }))
    .filter((c) => c.value > 0)
}

export function bookingsByStatus(bookings, t) {
  const counts = {}
  bookings.forEach((b) => {
    counts[b.status] = (counts[b.status] || 0) + 1
  })
  return Object.entries(counts).map(([status, value]) => ({
    name: t && STATUS_LABEL[status] ? t(STATUS_LABEL[status]) : status,
    status,
    value,
  }))
}

export function bookingsByStaff(bookings, staff, limit = 5) {
  const counts = {}
  bookings.forEach((b) => {
    if (!b.staffId) return
    counts[b.staffId] = (counts[b.staffId] || 0) + 1
  })
  return staff
    .map((s) => ({ name: s.name.split(' ')[0], value: counts[s.id] || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}
