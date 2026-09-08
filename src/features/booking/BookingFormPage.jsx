import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CalendarClock, MapPin, Phone, ShieldAlert, Tag, FileText } from 'lucide-react'
import { categoriesApi, createBooking, getServiceStartingPrice } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function BookingFormPage() {
  const { t } = useTranslation()
  const { categorySlug, serviceId } = useParams()
  const { session } = useSession()
  const navigate = useNavigate()

  const SCHEDULE_TYPES = [
    { value: 'hourly', label: t('booking.scheduleHourly'), caption: t('booking.scheduleOneTimeCaption') },
    { value: 'daily', label: t('booking.scheduleDaily'), caption: t('booking.scheduleDailyCaption') },
    { value: 'weekly', label: t('booking.scheduleWeekly'), caption: t('booking.scheduleWeeklyCaption') },
  ]

  const CARE_TAGS = [
    { value: 'medication-management', label: t('booking.tagMedicationManagement') },
    { value: 'mobility-assistance', label: t('booking.tagMobilityAssistance') },
    { value: 'dementia-support', label: t('booking.tagDementiaSupport') },
    { value: 'post-surgery-care', label: t('booking.tagPostSurgeryCare') },
    { value: 'diabetic-care', label: t('booking.tagDiabeticCare') },
  ]

  const categories = categoriesApi.listSync()
  const category = categories.find((c) => c.slug === categorySlug)
  const service = category?.services.find((s) => s.id === serviceId)

  const [form, setForm] = useState({
    scheduleType: 'hourly',
    startDate: '',
    time: '',
    address: '',
    contactName: session?.name ?? '',
    contactPhone: session?.phone ?? '',
    emergencyContact: '',
    notes: '',
  })
  const [tags, setTags] = useState([])
  const [submitting, setSubmitting] = useState(false)

  if (!category || !service) return <Navigate to="/services" replace />

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleTag(tag) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const booking = await createBooking({
      userId: session.id,
      categoryId: category.id,
      serviceId: service.id,
      serviceName: service.name,
      scheduleType: form.scheduleType,
      startDate: form.startDate,
      time: form.time,
      address: form.address,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      emergencyContact: form.emergencyContact,
      notes: form.notes.trim(),
      careTags: tags,
      amount: service.priceFrom ?? getServiceStartingPrice(service.id) ?? 0,
    })
    setSubmitting(false)
    navigate(`/user/book/${booking.id}/match`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="eyebrow text-brand-700">{category.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{t('booking.bookTitle', { serviceName: service.name })}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('booking.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
              <CalendarClock size={14} className="text-brand-500" />
              {t('booking.scheduleSectionTitle')}
            </h3>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {SCHEDULE_TYPES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => update('scheduleType', s.value)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors ${
                    form.scheduleType === s.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-900/[0.03] text-brand-700 hover:bg-slate-900/[0.06]'
                  }`}
                >
                  <span className="block text-sm font-medium">{s.label}</span>
                  <span
                    className={`mt-0.5 block text-[11px] leading-tight ${
                      form.scheduleType === s.value ? 'text-brand-100' : 'text-slate-500'
                    }`}
                  >
                    {s.caption}
                  </span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('booking.startDateLabel')}
                type="date"
                required
                value={form.startDate}
                onChange={(e) => update('startDate', e.target.value)}
              />
              <Input
                label={t('booking.timeLabel')}
                type="time"
                required
                value={form.time}
                onChange={(e) => update('time', e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
              <MapPin size={14} className="text-brand-500" />
              {t('booking.locationSectionTitle')}
            </h3>
            <div className="space-y-4">
              <Input
                label={t('booking.streetAddressLabel')}
                required
                placeholder={t('booking.streetAddressPlaceholder')}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('booking.contactNameLabel')}
                  required
                  value={form.contactName}
                  onChange={(e) => update('contactName', e.target.value)}
                />
                <Input
                  label={t('booking.contactPhoneLabel')}
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={form.contactPhone}
                  onChange={(e) => update('contactPhone', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <Input
                label={t('booking.emergencyContactLabel')}
                inputMode="numeric"
                maxLength={10}
                placeholder={t('booking.emergencyContactPlaceholder')}
                value={form.emergencyContact}
                onChange={(e) => update('emergencyContact', e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
              <Tag size={14} className="text-brand-500" />
              {t('booking.careRequirementsTitle')}
              <span className="font-normal text-slate-400">{t('booking.optional')}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {CARE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    tags.includes(tag.value)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-slate-900/[0.025] text-slate-500 hover:border-brand-600/40 hover:text-slate-900'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
              <FileText size={14} className="text-brand-500" />
              {t('booking.remarksTitle')}
              <span className="font-normal text-slate-400">{t('booking.optional')}</span>
            </h3>
            <textarea
              rows={3}
              placeholder={t('booking.remarksPlaceholder')}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="w-full rounded-lg border border-line bg-surface text-slate-900 placeholder:text-slate-400/70 p-3 text-sm outline-none focus:border-brand-600/70 focus:ring-4 focus:ring-brand-600/15"
            />
          </Card>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
            <ShieldAlert size={15} className="mt-0.5 shrink-0" />
            {t('booking.privacyNotice')}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <Phone size={17} />
            {submitting ? t('booking.findingCaregivers') : t('booking.findCaregiver')}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
