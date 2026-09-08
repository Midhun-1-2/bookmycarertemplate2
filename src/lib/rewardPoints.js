// Reward points — 1 point per ₹1, per the client's brief: every rupee spent by a
// care seeker or earned by a caregiver accrues points that a future rewards
// programme will draw on. Points are derived from bookings rather than stored,
// so a balance can never drift out of sync with the payments behind it.

export const POINTS_PER_RUPEE = 1

export function pointsFromAmount(amount) {
  return Math.round((Number(amount) || 0) * POINTS_PER_RUPEE)
}

function entry(booking) {
  return {
    id: booking.id,
    serviceName: booking.serviceName,
    date: booking.checkOut ?? booking.startDate ?? booking.createdAt,
    amount: Number(booking.payment?.amount) || 0,
    points: pointsFromAmount(booking.payment?.amount),
  }
}

function newestFirst(a, b) {
  return new Date(b.date) - new Date(a.date)
}

// Care seekers accrue on every rupee actually paid.
export function getSeekerPointsHistory(bookings, userId) {
  return bookings
    .filter((b) => b.userId === userId && b.payment?.status === 'paid' && b.payment?.amount)
    .map(entry)
    .sort(newestFirst)
}

// Caregivers accrue on every rupee earned, i.e. engagements they completed.
export function getCaregiverPointsHistory(bookings, staffId) {
  return bookings
    .filter((b) => b.staffId === staffId && b.status === 'completed' && b.payment?.amount)
    .map(entry)
    .sort(newestFirst)
}

export function totalPoints(history) {
  return history.reduce((sum, e) => sum + e.points, 0)
}
