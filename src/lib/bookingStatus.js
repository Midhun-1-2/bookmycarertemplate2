export const STATUS_TONE = {
  pending: 'warning',
  confirmed: 'accent',
  'in-progress': 'accent',
  completed: 'success',
  cancelled: 'danger',
  unattended: 'danger',
}

// Values are i18next translation keys (not display text) — resolve with t(STATUS_LABEL[status])
// at render time. The object KEYS above/below must stay in English; they're used in comparisons.
export const STATUS_LABEL = {
  pending: 'bookingStatus.pending',
  confirmed: 'bookingStatus.confirmed',
  'in-progress': 'bookingStatus.inProgress',
  completed: 'bookingStatus.completed',
  cancelled: 'bookingStatus.cancelled',
  unattended: 'bookingStatus.unattended',
}

const UNATTENDED_GRACE_MINUTES = 30

// Admin/Super Admin views only: a confirmed booking whose scheduled time has passed
// (past a grace period) with no recorded check-in is surfaced as "unattended" so staff
// no-shows are visible, without needing to mutate the booking's stored status.
export function getDisplayStatus(booking, now = new Date()) {
  if (booking.status === 'confirmed' && !booking.checkIn) {
    const scheduled = new Date(`${booking.startDate}T${booking.time}`)
    if (!Number.isNaN(scheduled.getTime()) && now - scheduled > UNATTENDED_GRACE_MINUTES * 60 * 1000) {
      return 'unattended'
    }
  }
  return booking.status
}
