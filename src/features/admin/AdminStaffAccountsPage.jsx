import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Star, IndianRupee, Pencil, UserCheck, FileText, MapPin, Check, X } from 'lucide-react'
import { staffApi, bookingsApi, categoriesApi, createStaffAccount, getStaffAverageRating } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import { Table, TableHead, TableBody, Th, Td, Tr } from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/dashboard/PageHeader'

const emptyForm = {
  name: '',
  phone: '',
  city: '',
  area: '',
  skills: '',
  categories: [],
  hourlyRate: '300',
  serviceRadiusKm: '10',
  experienceYears: '0',
  rating: '0',
}

const STAFF_STATUS_LABELS = {
  active: 'adminStaff.statusActive',
  inactive: 'adminStaff.statusInactive',
  pending: 'adminStaff.statusPending',
}

const STAFF_STATUS_TONES = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
}

// Self-registered caregivers are approved into 'active'; everyone else toggles.
function nextStatus(status) {
  if (status === 'pending') return 'active'
  return status === 'active' ? 'inactive' : 'active'
}

export default function AdminStaffAccountsPage() {
  const { t } = useTranslation()
  const { session } = useSession()
  const [staff, setStaff] = useState(null)
  const [bookings, setBookings] = useState([])
  const categories = categoriesApi.listSync()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingDocs, setEditingDocs] = useState([])
  const [confirmStaff, setConfirmStaff] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const [rejectStaff, setRejectStaff] = useState(null)
  const [rejecting, setRejecting] = useState(false)

  async function load() {
    setStaff(await staffApi.list())
    setBookings(await bookingsApi.list())
  }

  useEffect(() => {
    load()
  }, [])

  function toggleCategory(catId) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(catId)
        ? f.categories.filter((c) => c !== catId)
        : [...f.categories, catId],
    }))
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingDocs([])
    setEditingId(null)
    setOpen(true)
  }

  function openEdit(s) {
    setForm({
      name: s.name,
      phone: s.phone,
      city: s.city,
      area: s.area,
      skills: (s.skills || []).join(', '),
      categories: s.categories || [],
      hourlyRate: String(s.hourlyRate ?? '300'),
      serviceRadiusKm: String(s.serviceRadiusKm ?? '10'),
      experienceYears: String(s.experienceYears ?? '0'),
      rating: String(s.rating ?? '0'),
    })
    setEditingDocs(s.documents || [])
    setEditingId(s.id)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      phone: form.phone,
      city: form.city,
      area: form.area,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      categories: form.categories,
      hourlyRate: Number(form.hourlyRate) || 300,
      serviceRadiusKm: Number(form.serviceRadiusKm) || 10,
      experienceYears: Number(form.experienceYears) || 0,
      rating: Math.min(5, Math.max(0, Number(form.rating) || 0)),
    }
    if (editingId) {
      await staffApi.update(editingId, payload)
    } else {
      await createStaffAccount(payload, session.id)
    }
    setSaving(false)
    closeModal()
    load()
  }

  async function approvePending(s) {
    setReviewing(s.id)
    await staffApi.update(s.id, { status: 'active' })
    setReviewing(null)
    load()
  }

  async function confirmReject() {
    setRejecting(true)
    await staffApi.update(rejectStaff.id, { status: 'inactive' })
    setRejecting(false)
    setRejectStaff(null)
    load()
  }

  async function confirmToggleStatus() {
    setTogglingStatus(true)
    await staffApi.update(confirmStaff.id, { status: nextStatus(confirmStaff.status) })
    setTogglingStatus(false)
    setConfirmStaff(null)
    load()
  }

  const pending = (staff ?? []).filter((s) => s.status === 'pending')

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader title={t('adminStaff.title')} subtitle={t('adminStaff.subtitle')} />
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus size={17} />
          {t('adminStaff.createStaff')}
        </Button>
      </div>

      {pending.length > 0 && (
        <Card className="mt-6 border-l-2 border-l-amber-400 bg-amber-50/50" animate={false}>
          <div className="flex items-center gap-2">
            <UserCheck size={17} className="shrink-0 text-amber-600" />
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-700">
              {t('adminStaff.pendingApprovalsTitle', { count: pending.length })}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">{t('adminStaff.pendingApprovalsSubtitle')}</p>

          <ul className="mt-4 space-y-3">
            {pending.map((s) => (
              <li key={s.id} className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(35,31,32,0.04)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{s.phone}</span>
                      {s.email && <span className="truncate">{s.email}</span>}
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {s.area}, {s.city}
                      </span>
                      <span>{t('staffProfile.experienceYears', { count: s.experienceYears ?? 0 })}</span>
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {(s.categories ?? []).map((catId) => {
                        const cat = categories.find((c) => c.id === catId)
                        return cat ? <Badge key={catId} tone="brand">{cat.name}</Badge> : null
                      })}
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-700">{t('adminStaff.documentsTitle')}</p>
                      {(s.documents ?? []).length === 0 ? (
                        <p className="mt-1 text-xs text-rose-600">{t('adminStaff.documentsEmptyWarning')}</p>
                      ) : (
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {s.documents.map((doc) => (
                            <li
                              key={doc.id}
                              className="flex items-center gap-1 rounded-full border border-line bg-slate-900/[0.03] px-2.5 py-1 text-[11px] text-slate-600"
                            >
                              <FileText size={11} className="shrink-0 text-brand-500" />
                              {doc.type || t('adminStaff.documentUntyped')}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => approvePending(s)}
                      disabled={reviewing === s.id}
                    >
                      <Check size={15} />
                      {t('adminStaff.approve')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectStaff(s)}>
                      <X size={15} />
                      {t('adminStaff.reject')}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {staff && (
        <div className="mt-6">
          <Table>
            <TableHead>
              <Th>{t('adminStaff.colName')}</Th>
              <Th>{t('adminStaff.colPhone')}</Th>
              <Th>{t('adminStaff.colLocation')}</Th>
              <Th>{t('adminStaff.colCategories')}</Th>
              <Th>{t('adminStaff.colRate')}</Th>
              <Th>{t('adminStaff.colRadius')}</Th>
              <Th>{t('adminStaff.colRating')}</Th>
              <Th>{t('adminStaff.colStatus')}</Th>
              <Th>{t('adminStaff.colActions')}</Th>
            </TableHead>
            <TableBody>
              {staff.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium text-slate-800">{s.name}</Td>
                  <Td>{s.phone}</Td>
                  <Td>{s.area}, {s.city}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {s.categories.map((catId) => {
                        const cat = categories.find((c) => c.id === catId)
                        return cat ? <Badge key={catId} tone="brand">{cat.name}</Badge> : null
                      })}
                    </div>
                  </Td>
                  <Td>
                    <span className="flex items-center text-slate-700">
                      <IndianRupee size={12} />
                      {s.hourlyRate ?? '—'}/hr
                    </span>
                  </Td>
                  <Td>{s.serviceRadiusKm ? t('adminStaff.radiusKm', { radius: s.serviceRadiusKm }) : '—'}</Td>
                  <Td>
                    <span className="flex items-center gap-1 text-gold-500">
                      <Star size={13} fill="currentColor" /> {getStaffAverageRating(s.id, bookings, s.rating) || '—'}
                    </span>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => setConfirmStaff(s)}
                      className="cursor-pointer"
                      aria-label={t('adminStaff.toggleStatus')}
                    >
                      <Badge tone={STAFF_STATUS_TONES[s.status] ?? 'neutral'}>{t(STAFF_STATUS_LABELS[s.status] ?? s.status)}</Badge>
                    </button>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-900/[0.04] hover:text-brand-700"
                      aria-label={t('adminStaff.edit')}
                    >
                      <Pencil size={15} />
                    </button>
                  </Td>
                </Tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal open={open} onClose={closeModal} title={editingId ? t('adminStaff.editModalTitle') : t('adminStaff.createStaffAccount')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('adminStaff.fullName')}
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label={t('adminStaff.phoneNumber')}
            required
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('adminStaff.city')}
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <Input
              label={t('adminStaff.area')}
              required
              value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            />
          </div>
          <Input
            label={t('adminStaff.skillsCommaSeparated')}
            placeholder={t('adminStaff.skillsPlaceholder')}
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input
              label={t('adminStaff.hourlyRateInr')}
              type="number"
              value={form.hourlyRate}
              onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
            />
            <Input
              label={t('adminStaff.serviceRadiusKm')}
              type="number"
              value={form.serviceRadiusKm}
              onChange={(e) => setForm((f) => ({ ...f, serviceRadiusKm: e.target.value }))}
            />
            <Input
              label={t('adminStaff.experienceYears')}
              type="number"
              value={form.experienceYears}
              onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
            />
            <Input
              label={t('adminStaff.ratingLabel')}
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">{t('adminStaff.serviceCategories')}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.categories.includes(cat.id)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-slate-900/[0.025] text-slate-500 hover:border-brand-600/40 hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          {editingId && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">{t('adminStaff.documentsTitle')}</p>
              {editingDocs.length === 0 ? (
                <p className="text-xs text-slate-400">{t('adminStaff.documentsEmpty')}</p>
              ) : (
                <ul className="space-y-1.5">
                  {editingDocs.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-slate-700">
                        {doc.type || t('adminStaff.documentUntyped')}
                      </span>
                      <span className="truncate text-slate-400">
                        {doc.fileName || t('adminStaff.documentNoFile')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving
              ? (editingId ? t('adminStaff.saving') : t('adminStaff.creating'))
              : (editingId ? t('adminStaff.saveChanges') : t('adminStaff.createStaffAccount'))}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmStaff}
        title={
          confirmStaff?.status === 'pending'
            ? t('adminStaff.confirmApproveTitle')
            : t('adminStaff.confirmStatusTitle')
        }
        message={
          !confirmStaff
            ? ''
            : confirmStaff.status === 'pending'
              ? t('adminStaff.confirmApproveMessage', { name: confirmStaff.name })
              : t('adminStaff.confirmStatusMessage', {
                  name: confirmStaff.name,
                  status: t(STAFF_STATUS_LABELS[nextStatus(confirmStaff.status)]),
                })
        }
        tone={confirmStaff?.status === 'active' ? 'danger' : 'primary'}
        loading={togglingStatus}
        onConfirm={confirmToggleStatus}
        onClose={() => setConfirmStaff(null)}
      />

      <ConfirmDialog
        open={!!rejectStaff}
        title={t('adminStaff.confirmRejectTitle')}
        message={rejectStaff ? t('adminStaff.confirmRejectMessage', { name: rejectStaff.name }) : ''}
        tone="danger"
        loading={rejecting}
        onConfirm={confirmReject}
        onClose={() => setRejectStaff(null)}
      />
    </div>
  )
}
