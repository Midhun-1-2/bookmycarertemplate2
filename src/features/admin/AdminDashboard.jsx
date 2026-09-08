import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, FolderKanban, ClipboardList, IndianRupee } from 'lucide-react'
import { staffApi, categoriesApi, bookingsApi } from '../../lib/mockApi'
import { getDisplayStatus } from '../../lib/bookingStatus'
import {
  revenueByDay,
  bookingsByCategory,
  bookingsByStatus,
  bookingsByStaff,
} from '../../lib/chartData'
import PageHeader from '../../components/dashboard/PageHeader'
import StatTile from '../../components/dashboard/StatTile'
import ChartCard from '../../components/dashboard/ChartCard'
import RevenueTrendChart from '../../components/charts/RevenueTrendChart'
import CategoryDonutChart from '../../components/charts/CategoryDonutChart'
import StatusBarChart from '../../components/charts/StatusBarChart'
import StaffBarChart from '../../components/charts/StaffBarChart'
import DayRangeSelect from '../../components/charts/DayRangeSelect'
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [revenueDays, setRevenueDays] = useState(14)

  useEffect(() => {
    async function load() {
      const [staff, categories, bookings] = await Promise.all([
        staffApi.list(),
        categoriesApi.list(),
        bookingsApi.list(),
      ])
      setData({ staff, categories, bookings })
    }
    load()
  }, [])

  if (!data) return <DashboardSkeleton tiles={4} charts={4} />

  const { staff, categories, bookings } = data
  const revenue = bookings
    .filter((b) => b.payment.status === 'paid')
    .reduce((sum, b) => sum + b.payment.amount, 0)

  const stats = {
    staffCount: staff.length,
    categoryCount: categories.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    totalBookings: bookings.length,
    revenue,
  }

  const charts = {
    revenue: revenueByDay(bookings, revenueDays),
    byCategory: bookingsByCategory(bookings, categories),
    byStatus: bookingsByStatus(
      bookings.map((b) => ({ ...b, status: getDisplayStatus(b) })),
      t
    ),
    byStaff: bookingsByStaff(bookings, staff),
  }

  const cards = [
    {
      label: t('adminDashboard.staffAccounts'),
      value: stats.staffCount,
      icon: Users,
      to: '/admin/staff',
    },
    {
      label: t('adminDashboard.serviceCategories'),
      value: stats.categoryCount,
      icon: FolderKanban,
      to: '/admin/categories',
      tone: 'accent',
    },
    {
      label: t('adminDashboard.pendingBookings'),
      value: stats.pendingBookings,
      icon: ClipboardList,
      to: '/admin/bookings',
      tone: 'gold',
    },
    {
      label: t('adminDashboard.revenueCollected'),
      value: stats.revenue,
      prefix: '₹',
      icon: IndianRupee,
      to: '/admin/bookings',
      tone: 'success',
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow={t('roleLabel.admin')}
        title={t('adminDashboard.title')}
        subtitle={t('adminDashboard.subtitle')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <StatTile key={card.label} index={i} {...card} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title={t('adminDashboard.revenueLast14Days')}
          action={<DayRangeSelect value={revenueDays} onChange={setRevenueDays} />}
        >
          <RevenueTrendChart data={charts.revenue} />
        </ChartCard>
        <ChartCard title={t('adminDashboard.bookingsByCategory')}>
          <CategoryDonutChart data={charts.byCategory} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title={t('adminDashboard.bookingsByStatus')}>
          <StatusBarChart data={charts.byStatus} />
        </ChartCard>
        <ChartCard title={t('adminDashboard.topStaffByEngagements')}>
          <StaffBarChart data={charts.byStaff} />
        </ChartCard>
      </div>
    </div>
  )
}
