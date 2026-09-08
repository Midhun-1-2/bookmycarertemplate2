import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Star, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { bookingsApi, staffApi, getStaffAverageRating } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import { revenueByDay, bookingsByStatus } from '../../lib/chartData'
import RewardPointsCard from '../../components/RewardPointsCard'
import { getCaregiverPointsHistory } from '../../lib/rewardPoints'
import PageHeader from '../../components/dashboard/PageHeader'
import StatTile from '../../components/dashboard/StatTile'
import ChartCard from '../../components/dashboard/ChartCard'
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton'
import RevenueTrendChart from '../../components/charts/RevenueTrendChart'
import StatusBarChart from '../../components/charts/StatusBarChart'
import DayRangeSelect from '../../components/charts/DayRangeSelect'
import Reveal from '../../components/motion/Reveal'
import { BookingRow } from '../user/UserDashboard'

export default function StaffDashboard() {
  const { t } = useTranslation()
  const { session } = useSession()
  const [bookings, setBookings] = useState(null)
  const [seedRating, setSeedRating] = useState(0)
  const [status, setStatus] = useState(null)
  const [revenueDays, setRevenueDays] = useState(14)

  useEffect(() => {
    async function load() {
      const all = await bookingsApi.list()
      setBookings(all.filter((b) => b.staffId === session.id))
      const profile = await staffApi.get(session.id)
      setSeedRating(profile?.rating ?? 0)
      setStatus(profile?.status ?? null)
    }
    load()
  }, [session.id])

  if (bookings === null) return <DashboardSkeleton tiles={3} charts={2} />

  const upcoming = bookings.filter((b) => ['confirmed', 'in-progress'].includes(b.status))
  const completed = bookings.filter((b) => b.status === 'completed')
  const rating = getStaffAverageRating(session.id, bookings, seedRating)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={t('roleLabel.staff')}
        title={t('staffDashboard.welcome', { name: session.name.split(' ')[0] })}
        subtitle={t('staffDashboard.subtitle')}
      />

      {status === 'pending' && (
        <Reveal className="mb-5 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-5">
          <div className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/12 text-amber-600">
              <ShieldAlert size={17} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold tracking-tight text-amber-800">
                {t('staffDashboard.pendingTitle')}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-900/85">
                {t('staffDashboard.pendingMessage')}
              </p>
              <Link
                to="/staff/profile"
                className="group mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-700"
              >
                {t('staffDashboard.pendingUploadCta')}
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      )}

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
          label={t('staffDashboard.rating')}
          value={rating || '—'}
          decimals={1}
          icon={Star}
          tone="gold"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title={t('staffDashboard.earningsChartTitle')}
          action={<DayRangeSelect value={revenueDays} onChange={setRevenueDays} />}
        >
          <RevenueTrendChart data={revenueByDay(bookings, revenueDays)} />
        </ChartCard>
        <ChartCard title={t('staffDashboard.statusChartTitle')}>
          <StatusBarChart data={bookingsByStatus(bookings, t)} />
        </ChartCard>
      </div>

      <RewardPointsCard
        className="mt-4"
        variant="caregiver"
        history={getCaregiverPointsHistory(bookings, session.id)}
      />

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {t('staffDashboard.upcomingEngagements')}
        </h2>
        <Link
          to="/staff/engagements"
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
          <p className="text-sm text-slate-500">{t('staffDashboard.noUpcoming')}</p>
        </Reveal>
      ) : (
        <div className="mt-4 space-y-3">
          {upcoming.map((b, i) => (
            <BookingRow
              key={b.id}
              booking={b}
              index={i}
              showAddress
              to={`/staff/engagements/${b.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
