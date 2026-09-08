import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, MapPin, Phone, ShieldAlert, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import { bookingsApi, verifyCheckIn, verifyCheckOut } from '../../lib/mockApi'
import { STATUS_TONE, STATUS_LABEL } from '../../lib/bookingStatus'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const SCHEDULE_TYPE_LABEL_KEY = {
  hourly: 'staffEngagementDetail.scheduleType.hourly',
  daily: 'staffEngagementDetail.scheduleType.daily',
  weekly: 'staffEngagementDetail.scheduleType.weekly',
}

export default function StaffEngagementDetailPage() {
  const { t } = useTranslation()
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  async function load() {
    setBooking(await bookingsApi.get(bookingId))
  }

  useEffect(() => {
    load()
  }, [bookingId])

  async function handleVerify() {
    setError('')
    setVerifying(true)
    const action = booking.status === 'confirmed' ? verifyCheckIn : verifyCheckOut
    const result = await action(bookingId, code)
    setVerifying(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setCode('')
    await load()
  }

  if (!booking) return null

  const canVerify = booking.status === 'confirmed' || booking.status === 'in-progress'

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/staff/engagements" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft size={14} /> {t('staffEngagementDetail.engagements')}
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{booking.serviceName}</h1>
        <Badge tone={STATUS_TONE[booking.status]}>{t(STATUS_LABEL[booking.status])}</Badge>
      </div>

      <Card className="mt-5 space-y-4" animate={false}>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CalendarClock size={14} className="text-brand-500" />
          {booking.startDate} at {booking.time} · <span className="capitalize">{t(SCHEDULE_TYPE_LABEL_KEY[booking.scheduleType] ?? SCHEDULE_TYPE_LABEL_KEY.hourly)}</span>
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
          {t('staffEngagementDetail.emergencyContact', { contact: booking.emergencyContact })}
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

      {canVerify && (
        <Card className="mt-4" animate={false}>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
            <KeyRound size={14} className="text-brand-500" />
            {booking.status === 'confirmed' ? t('staffEngagementDetail.checkInTitle') : t('staffEngagementDetail.checkOutTitle')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t('staffEngagementDetail.passcodeInstructions')}
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder={t('staffEngagementDetail.enterPasscode')}
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              error={error}
              className="flex-1"
            />
            <Button onClick={handleVerify} disabled={verifying || code.length < 4}>
              {verifying ? t('staffEngagementDetail.verifying') : t('staffEngagementDetail.verify')}
            </Button>
          </div>
        </Card>
      )}

      {booking.status === 'completed' && (
        <Card className="mt-4 flex items-center gap-2 text-sm text-emerald-700" animate={false}>
          <CheckCircle2 size={17} />
          {t('staffEngagementDetail.shiftCompleted', {
            checkIn: new Date(booking.checkIn).toLocaleTimeString(),
            checkOut: new Date(booking.checkOut).toLocaleTimeString(),
          })}
        </Card>
      )}
    </div>
  )
}
