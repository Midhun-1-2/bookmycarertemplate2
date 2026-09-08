import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, MapPin, Phone, ShieldAlert, IndianRupee, ArrowLeft, KeyRound, MessageSquareText, XCircle } from 'lucide-react'
import { bookingsApi, staffApi, requestCheckInOtp, submitReview, cancelBooking } from '../../lib/mockApi'
import { STATUS_TONE, STATUS_LABEL } from '../../lib/bookingStatus'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import StarRating, { StarRatingDisplay } from '../../components/ui/StarRating'

const PAYMENT_STATUS_LABEL = {
  paid: 'userBookingDetail.paymentStatus.paid',
  pending: 'userBookingDetail.paymentStatus.pending',
}

const SCHEDULE_TYPE_LABEL = {
  hourly: 'userBookingDetail.scheduleType.hourly',
  daily: 'userBookingDetail.scheduleType.daily',
  weekly: 'userBookingDetail.scheduleType.weekly',
}

const CANCELLABLE_STATUSES = ['pending', 'confirmed']
const CANCEL_CUTOFF_MS = 60 * 60 * 1000

export default function BookingDetailPage() {
  const { t } = useTranslation()
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [staff, setStaff] = useState(null)
  const [otp, setOtp] = useState(null)
  const [otpPhase, setOtpPhase] = useState('checkin')
  const [generatingOtp, setGeneratingOtp] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const otpTimerRef = useRef(null)

  async function load() {
    const b = await bookingsApi.get(bookingId)
    setBooking(b)
    if (b?.checkIn) setOtpPhase('checkout')
    if (b?.staffId) setStaff(await staffApi.get(b.staffId))
  }

  useEffect(() => {
    load()
  }, [bookingId])

  useEffect(() => () => clearTimeout(otpTimerRef.current), [])

  async function handleGenerateOtp() {
    setGeneratingOtp(true)
    const code = await requestCheckInOtp(bookingId)
    setOtp(code)
    setGeneratingOtp(false)
    clearTimeout(otpTimerRef.current)
    otpTimerRef.current = setTimeout(() => {
      setOtp(null)
      setOtpPhase('checkout')
    }, 5000)
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!reviewRating) return
    setSubmittingReview(true)
    await submitReview(bookingId, { rating: reviewRating, comment: reviewComment.trim() })
    setSubmittingReview(false)
    await load()
  }

  async function handleCancel() {
    setCancelling(true)
    await cancelBooking(bookingId)
    setCancelling(false)
    await load()
  }

  if (!booking) return null

  const isCancellableStatus = CANCELLABLE_STATUSES.includes(booking.status)
  const scheduledAt = new Date(`${booking.startDate}T${booking.time}`)
  const canCancel =
    isCancellableStatus &&
    !Number.isNaN(scheduledAt.getTime()) &&
    scheduledAt.getTime() - Date.now() > CANCEL_CUTOFF_MS

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/user/bookings" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft size={14} /> {t('userBookingDetail.backToBookings')}
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{booking.serviceName}</h1>
        <Badge tone={STATUS_TONE[booking.status]}>{t(STATUS_LABEL[booking.status])}</Badge>
      </div>

      <Card className="mt-5 space-y-4" animate={false}>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CalendarClock size={14} className="text-brand-500" />
          {booking.startDate} {t('userBookingDetail.at')} {booking.time} · <span className="capitalize">{t(SCHEDULE_TYPE_LABEL[booking.scheduleType])}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <MapPin size={14} className="text-brand-500" />
          {booking.address}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Phone size={14} className="text-brand-500" />
          {booking.contactName} · {booking.contactPhone}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <ShieldAlert size={14} className="text-brand-500" />
          {t('userBookingDetail.emergencyContact')} {booking.emergencyContact}
        </div>

        {booking.careTags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {booking.careTags.map((t) => (
              <Badge key={t} tone="neutral">{t}</Badge>
            ))}
          </div>
        )}
        {booking.notes && (
          <p className="rounded-lg bg-slate-900/[0.03] px-3 py-2 text-sm text-slate-600">{booking.notes}</p>
        )}
      </Card>

      {staff && (
        <Card className="mt-4" animate={false}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('userBookingDetail.yourCaregiver')}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600/12 font-semibold text-brand-700">
              {staff.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-medium text-slate-900">{staff.name}</p>
              <p className="text-xs text-slate-500">{staff.skills.join(', ')}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mt-4" animate={false}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{t('userBookingDetail.invoiceAmount')}</p>
          <p className="flex items-center text-lg font-semibold text-brand-700">
            <IndianRupee size={16} />
            {booking.payment.amount}
          </p>
        </div>
        <p className="mt-1 text-xs capitalize text-slate-400">{t('userBookingDetail.paymentPrefix')} {t(PAYMENT_STATUS_LABEL[booking.payment.status])}</p>
        {booking.payment.status === 'pending' && booking.staffId && (
          <Link to={`/user/book/${booking.id}/checkout`}>
            <Button className="mt-3 w-full">{t('userBookingDetail.payNow')}</Button>
          </Link>
        )}
        {booking.status === 'pending' && !booking.staffId && (
          <Link to={`/user/book/${booking.id}/match`}>
            <Button className="mt-3 w-full" variant="outline">{t('userBookingDetail.viewCaregiverMatches')}</Button>
          </Link>
        )}
      </Card>

      {isCancellableStatus && (
        <Card className="mt-4" animate={false}>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <XCircle size={13} />
            {t('userBookingDetail.cancelBookingTitle')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t('userBookingDetail.cancelWindowNote')}
          </p>
          <Button
            className="mt-3"
            variant="danger"
            onClick={handleCancel}
            disabled={!canCancel || cancelling}
          >
            {cancelling ? t('userBookingDetail.cancelling') : t('userBookingDetail.cancelBooking')}
          </Button>
          {!canCancel && (
            <p className="mt-2 text-xs text-rose-500">{t('userBookingDetail.cancelWindowClosed')}</p>
          )}
        </Card>
      )}

      {(booking.status === 'confirmed' || booking.status === 'in-progress') && (
        <Card className="mt-4" animate={false}>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <KeyRound size={13} />
            {otpPhase === 'checkin' ? t('userBookingDetail.checkInPasscode') : t('userBookingDetail.checkOutPasscode')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t('userBookingDetail.passcodeDescription')}
          </p>
          {otp ? (
            <p className="mt-3 text-3xl font-bold tracking-[0.3em] text-brand-700">{otp}</p>
          ) : (
            <Button className="mt-3" variant="outline" onClick={handleGenerateOtp} disabled={generatingOtp}>
              {generatingOtp
                ? t('userBookingDetail.generating')
                : otpPhase === 'checkin'
                  ? t('userBookingDetail.generatePasscode')
                  : t('userBookingDetail.generateCheckoutPasscode')}
            </Button>
          )}
        </Card>
      )}

      {(booking.checkIn || booking.checkOut) && (
        <Card className="mt-4" animate={false}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('userBookingDetail.shiftVerification')}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-700">
            {booking.checkIn && <p>{t('userBookingDetail.checkedIn', { time: new Date(booking.checkIn).toLocaleString() })}</p>}
            {booking.checkOut && <p>{t('userBookingDetail.checkedOut', { time: new Date(booking.checkOut).toLocaleString() })}</p>}
          </div>
        </Card>
      )}

      {booking.status === 'completed' && (
        <Card className="mt-4" animate={false}>
          <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
            <MessageSquareText size={14} className="text-brand-500" />
            {booking.review ? t('userBookingDetail.yourReview') : t('userBookingDetail.rateYourCaregiver')}
          </h3>
          {booking.review ? (
            <div className="mt-3">
              <StarRatingDisplay value={booking.review.rating} size={16} />
              {booking.review.comment && (
                <p className="mt-2 text-sm text-slate-600">{booking.review.comment}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="mt-3 space-y-3">
              <StarRating value={reviewRating} onChange={setReviewRating} />
              <textarea
                rows={3}
                placeholder={t('userBookingDetail.reviewPlaceholder')}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface text-slate-900 placeholder:text-slate-400/70 p-3 text-sm outline-none focus:border-brand-600/70 focus:ring-4 focus:ring-brand-600/15"
              />
              <Button type="submit" disabled={!reviewRating || submittingReview}>
                {submittingReview ? t('userBookingDetail.submittingReview') : t('userBookingDetail.submitReviewButton')}
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  )
}
