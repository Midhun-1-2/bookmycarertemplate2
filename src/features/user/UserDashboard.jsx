import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CalendarClock, ArrowUpRight, CheckCircle2, IndianRupee, MapPin } from 'lucide-react'
import { categoriesApi, bookingsApi } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import { STATUS_TONE, STATUS_LABEL } from '../../lib/bookingStatus'
import Badge from '../../components/ui/Badge'
import CategoryCard from '../../components/CategoryCard'
import RewardPointsCard from '../../components/RewardPointsCard'
import PageHeader from '../../components/dashboard/PageHeader'
import StatTile from '../../components/dashboard/StatTile'
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton'
import Spotlight from '../../components/motion/Spotlight'
import Reveal, { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import { getSeekerPointsHistory } from '../../lib/rewardPoints'
import { EASE_OUT_EXPO } from '../../lib/motion'

/**
 * A booking as a single scannable row: service and status on top, the practical
 * details (when, where) as mono metadata beneath. The whole row is the target,
 * so it lights up as one object rather than sprouting a "view" button.
 */
export function BookingRow({ booking, to, index = 0, showAddress = false }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: EASE_OUT_EXPO }}
    >
      <Link to={to} className="block">
        <Spotlight className="glass flex items-center justify-between gap-4 rounded-2xl p-4 transition-[border-color,transform] duration-400 hover:-translate-y-0.5 hover:border-brand-600/40 sm:p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="truncate font-semibold tracking-tight text-slate-900">
                {booking.serviceName}
              </p>
              <Badge tone={STATUS_TONE[booking.status]}>{t(STATUS_LABEL[booking.status])}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">
              <CalendarClock size={12} />
              {booking.startDate} · {booking.time}
            </p>
            {showAddress && booking.address && (
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                <MapPin size={12} className="shrink-0" />
                {booking.address}
              </p>
            )}
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line text-slate-400 transition-colors duration-400 group-hover:border-brand-600/50 group-hover:text-brand-700">
            <ArrowUpRight size={16} />
          </span>
        </Spotlight>
      </Link>
    </motion.div>
  )
}

export default function UserDashboard() {
  const { t } = useTranslation()
  const { session } = useSession()
  const categories = categoriesApi.listSync()
  const [bookings, setBookings] = useState(null)

  useEffect(() => {
    async function load() {
      const all = await bookingsApi.list()
      setBookings(all.filter((b) => b.userId === session.id))
    }
    load()
  }, [session.id])

  if (bookings === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardSkeleton tiles={3} charts={0} />
      </div>
    )
  }

  const upcoming = bookings.filter((b) =>
    ['pending', 'confirmed', 'in-progress'].includes(b.status)
  )
  const completed = bookings.filter((b) => b.status === 'completed')
  const totalSpent = bookings
    .filter((b) => b.payment.status === 'paid')
    .reduce((sum, b) => sum + b.payment.amount, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow={t('roleLabel.user')}
        title={t('userDashboard.welcome', {
          name: session?.name?.split(' ')[0] ?? t('userDashboard.there'),
        })}
        subtitle={t('userDashboard.subtitle')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          index={0}
          label={t('staffDashboard.upcoming')}
          value={upcoming.length}
          icon={CalendarClock}
        />
        <StatTile
          index={1}
          label={t('staffDashboard.completed')}
          value={completed.length}
          icon={CheckCircle2}
          tone="success"
        />
        <StatTile
          index={2}
          label={t('userProfile.totalSpentLabel')}
          value={totalSpent}
          prefix="₹"
          icon={IndianRupee}
          tone="gold"
        />
      </div>

      <RewardPointsCard
        className="mt-4"
        variant="seeker"
        history={getSeekerPointsHistory(bookings, session.id)}
      />

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {t('userMyBookings.title')}
        </h2>
        <Link
          to="/user/bookings"
          className="group flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-brand-700"
        >
          {t('staffDashboard.viewAll')}
          <ArrowUpRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <Reveal className="glass mt-4 rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-500">{t('userMyBookings.emptyState')}</p>
        </Reveal>
      ) : (
        <div className="mt-4 space-y-3">
          {upcoming.slice(0, 3).map((b, i) => (
            <BookingRow key={b.id} booking={b} index={i} to={`/user/bookings/${b.id}`} />
          ))}
        </div>
      )}

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {t('userShell.browseServices')}
      </h2>
      <RevealGroup gap={0.06} className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <RevealItem key={cat.id}>
            <CategoryCard category={cat} />
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  )
}
