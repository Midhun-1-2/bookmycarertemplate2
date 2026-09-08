import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, FolderKanban, ClipboardList, IndianRupee, ShieldCheck } from 'lucide-react'
import { staffApi, categoriesApi, bookingsApi, adminsApi, usersApi } from '../../lib/mockApi'
import { getDisplayStatus } from '../../lib/bookingStatus'
import { revenueByDay, bookingsByCategory, bookingsByStatus } from '../../lib/chartData'
import PageHeader from '../../components/dashboard/PageHeader'
import StatTile from '../../components/dashboard/StatTile'
import ChartCard from '../../components/dashboard/ChartCard'
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton'
import RevenueTrendChart from '../../components/charts/RevenueTrendChart'
import CategoryDonutChart from '../../components/charts/CategoryDonutChart'
import StatusBarChart from '../../components/charts/StatusBarChart'
import StaffBarChart from '../../components/charts/StaffBarChart'
import DayRangeSelect from '../../components/charts/DayRangeSelect'

export default function SuperAdminDashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [revenueDays, setRevenueDays] = useState(30)

  useEffect(() => {
    async function load() {
      const [staff, categories, bookings, admins, users] = await Promise.all([
        staffApi.list(),
        categoriesApi.list(),
        bookingsApi.list(),
        adminsApi.list(),
        usersApi.list(),
      ])
      setData({ staff, categories, bookings, admins, users })
    }
    load()
  }, [])

  if (!data) return <DashboardSkeleton tiles={5} charts={4} />

  const { staff, categories, bookings, admins, users } = data
  const revenue = bookings
    .filter((b) => b.payment.status === 'paid')
    .reduce((sum, b) => sum + b.payment.amount, 0)

  const stats = {
    staffCount: staff.length,
    categoryCount: categories.length,
    adminCount: admins.filter((a) => a.role === 'admin').length,
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
    byRole: [
      { name: t('superAdminDashboard.chartUsers'), value: users.length },
      { name: t('superAdminDashboard.chartStaff'), value: staff.length },
      {
        name: t('superAdminDashboard.chartAdmins'),
        value: admins.filter((a) => a.role === 'admin').length,
      },
      {
        name: t('superAdminDashboard.chartSuperAdmins'),
        value: admins.filter((a) => a.role === 'super-admin').length,
      },
    ],
  }

  const cards = [
    {
      label: t('superAdminDashboard.cardAdminAccounts'),
      value: stats.adminCount,
      icon: ShieldCheck,
      to: '/super-admin/admins',
    },
    {
      label: t('superAdminDashboard.cardStaffAccounts'),
      value: stats.staffCount,
      icon: Users,
      to: '/super-admin/staff',
      tone: 'accent',
    },
    {
      label: t('superAdminDashboard.cardServiceCategories'),
      value: stats.categoryCount,
      icon: FolderKanban,
      to: '/super-admin/categories',
      tone: 'gold',
    },
    {
      label: t('superAdminDashboard.cardTotalBookings'),
      value: stats.totalBookings,
      icon: ClipboardList,
      to: '/super-admin/bookings',
    },
    {
      label: t('superAdminDashboard.cardRevenueCollected'),
      value: stats.revenue,
      prefix: '₹',
      icon: IndianRupee,
      to: '/super-admin/bookings',
      tone: 'success',
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow={t('roleLabel.superAdmin')}
        title={t('superAdminDashboard.title')}
        subtitle={t('superAdminDashboard.subtitle')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, i) => (
          <StatTile key={card.label} index={i} {...card} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title={t('superAdminDashboard.headingRevenue')}
          action={<DayRangeSelect value={revenueDays} onChange={setRevenueDays} />}
        >
          <RevenueTrendChart data={charts.revenue} />
        </ChartCard>
        <ChartCard title={t('superAdminDashboard.headingByCategory')}>
          <CategoryDonutChart data={charts.byCategory} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title={t('superAdminDashboard.headingByStatus')}>
          <StatusBarChart data={charts.byStatus} />
        </ChartCard>
        <ChartCard title={t('superAdminDashboard.headingComposition')}>
          <StaffBarChart data={charts.byRole} />
        </ChartCard>
      </div>
    </div>
  )
}
