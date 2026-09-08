import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { bookingsApi, usersApi, staffApi } from '../../lib/mockApi'
import { STATUS_TONE, STATUS_LABEL, getDisplayStatus } from '../../lib/bookingStatus'
import { Table, TableHead, TableBody, Th, Td, Tr } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/dashboard/PageHeader'

const FILTERS = ['all', 'pending', 'confirmed', 'in-progress', 'unattended', 'completed', 'cancelled']

const FILTER_LABELS = {
  all: 'adminBookings.filterAll',
  pending: 'adminBookings.filterPending',
  confirmed: 'adminBookings.filterConfirmed',
  'in-progress': 'adminBookings.filterInProgress',
  unattended: 'adminBookings.filterUnattended',
  completed: 'adminBookings.filterCompleted',
  cancelled: 'adminBookings.filterCancelled',
}

const PAYMENT_STATUS_LABELS = {
  pending: 'adminBookings.paymentPending',
  paid: 'adminBookings.paymentPaid',
}

export default function AdminBookingsPage() {
  const { t } = useTranslation()
  const [bookings, setBookings] = useState(null)
  const [users, setUsers] = useState([])
  const [staff, setStaff] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const [b, u, s] = await Promise.all([bookingsApi.list(), usersApi.list(), staffApi.list()])
      setBookings(b)
      setUsers(u)
      setStaff(s)
    }
    load()
  }, [])

  if (!bookings) return null

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => getDisplayStatus(b) === filter)

  return (
    <div>
      <PageHeader title={t('adminBookings.title')} subtitle={t('adminBookings.subtitle')} />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-slate-900/[0.03] text-brand-700 hover:bg-slate-900/[0.06]'
            }`}
          >
            {t(FILTER_LABELS[f])}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Table>
          <TableHead>
            <Th>{t('adminBookings.colService')}</Th>
            <Th>{t('adminBookings.colCareSeeker')}</Th>
            <Th>{t('adminBookings.colCaregiver')}</Th>
            <Th>{t('adminBookings.colDate')}</Th>
            <Th>{t('adminBookings.colAmount')}</Th>
            <Th>{t('adminBookings.colStatus')}</Th>
          </TableHead>
          <TableBody>
            {filtered.map((b) => {
              const user = users.find((u) => u.id === b.userId)
              const s = staff.find((st) => st.id === b.staffId)
              return (
                <Tr key={b.id}>
                  <Td className="font-medium text-slate-800">{b.serviceName}</Td>
                  <Td>{user?.name ?? '—'}</Td>
                  <Td>{s?.name ?? t('adminBookings.unmatched')}</Td>
                  <Td>{b.startDate}</Td>
                  <Td>₹{b.payment.amount} <span className="text-xs text-slate-400 capitalize">({t(PAYMENT_STATUS_LABELS[b.payment.status])})</span></Td>
                  <Td>
                    <Badge tone={STATUS_TONE[getDisplayStatus(b)]}>{t(STATUS_LABEL[getDisplayStatus(b)])}</Badge>
                  </Td>
                </Tr>
              )
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && <p className="mt-6 text-center text-sm text-slate-400">{t('adminBookings.emptyState')}</p>}
      </div>
    </div>
  )
}
