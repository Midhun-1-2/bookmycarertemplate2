import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, MapPin } from 'lucide-react'
import { bookingsApi } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import { STATUS_TONE, STATUS_LABEL } from '../../lib/bookingStatus'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/dashboard/PageHeader'

const PAYMENT_STATUS_LABEL = {
  paid: 'userMyBookings.paymentStatus.paid',
  pending: 'userMyBookings.paymentStatus.pending',
}

export default function MyBookingsPage() {
  const { t } = useTranslation()
  const { session } = useSession()
  const [bookings, setBookings] = useState(null)

  useEffect(() => {
    async function load() {
      const all = await bookingsApi.list()
      setBookings(
        all
          .filter((b) => b.userId === session.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
    }
    load()
  }, [session.id])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={t('userMyBookings.title')} subtitle={t('userMyBookings.subtitle')} />

      {bookings === null ? (
        <p className="mt-6 text-sm text-slate-400">{t('userMyBookings.loading')}</p>
      ) : bookings.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">
          {t('userMyBookings.emptyState')}{' '}
          <Link to="/user/dashboard" className="font-medium text-brand-700 hover:underline">
            {t('userMyBookings.browseServices')}
          </Link>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <Link key={b.id} to={`/user/bookings/${b.id}`}>
              <Card className="flex flex-col justify-between gap-3 transition-[border-color,transform] duration-400 hover:-translate-y-0.5 hover:border-brand-600/45 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{b.serviceName}</p>
                    <Badge tone={STATUS_TONE[b.status]}>{t(STATUS_LABEL[b.status])}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarClock size={12} /> {b.startDate} · {b.time}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} /> {b.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-700">₹{b.payment.amount}</p>
                  <p className="text-xs text-slate-400 capitalize">{t(PAYMENT_STATUS_LABEL[b.payment.status])}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
