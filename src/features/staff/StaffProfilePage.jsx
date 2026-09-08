import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  User,
  CheckCircle2,
  Star,
  IndianRupee,
  MapPinned,
  MessageSquareText,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react'
import { staffApi, bookingsApi, categoriesApi, getStaffAverageRating } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/dashboard/PageHeader'

export default function StaffProfilePage() {
  const { t } = useTranslation()
  const { session } = useSession()
  const [profile, setProfile] = useState(null)
  const [skillsText, setSkillsText] = useState('')
  const [bookings, setBookings] = useState([])
  const [saved, setSaved] = useState(false)
  const [ratesSaved, setRatesSaved] = useState(false)
  const [docsSaved, setDocsSaved] = useState(false)
  const categories = categoriesApi.listSync()

  useEffect(() => {
    async function load() {
      const p = await staffApi.get(session.id)
      setProfile({ ...p, documents: p.documents || [] })
      setSkillsText((p.skills || []).join(', '))
      setBookings(await bookingsApi.list())
    }
    load()
  }, [session.id])

  function toggleCategory(catId) {
    setProfile((p) => ({
      ...p,
      categories: p.categories.includes(catId)
        ? p.categories.filter((c) => c !== catId)
        : [...p.categories, catId],
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    const payload = {
      ...profile,
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      experienceYears: Number(profile.experienceYears) || 0,
    }
    await staffApi.update(session.id, payload)
    setProfile(payload)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSaveRates(e) {
    e.preventDefault()
    await staffApi.update(session.id, {
      hourlyRate: Number(profile.hourlyRate) || 0,
      serviceRadiusKm: Number(profile.serviceRadiusKm) || 0,
    })
    setRatesSaved(true)
    setTimeout(() => setRatesSaved(false), 2000)
  }

  function addDocument() {
    setProfile((p) => ({
      ...p,
      documents: [
        ...(p.documents || []),
        { id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: '', fileName: '' },
      ],
    }))
  }

  function updateDocument(id, patch) {
    setProfile((p) => ({
      ...p,
      documents: p.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }))
  }

  function removeDocument(id) {
    setProfile((p) => ({ ...p, documents: p.documents.filter((d) => d.id !== id) }))
  }

  async function handleSaveDocuments(e) {
    e.preventDefault()
    await staffApi.update(session.id, { documents: profile.documents || [] })
    setDocsSaved(true)
    setTimeout(() => setDocsSaved(false), 2000)
  }

  if (!profile) return null

  const averageRating = getStaffAverageRating(session.id, bookings, profile.rating)
  const reviews = bookings
    .filter((b) => b.staffId === session.id && b.review)
    .sort((a, b) => new Date(b.review.createdAt) - new Date(a.review.createdAt))

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('staffProfile.title')} subtitle={t('staffProfile.subtitle')} />

      <Card className="mt-6" animate={false}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/12 text-lg font-semibold text-brand-700">
            {profile.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile.name}</p>
            <p className="flex items-center gap-1 text-sm text-gold-500">
              <Star size={13} fill="currentColor" /> {averageRating || '—'} · {t('staffProfile.experienceYears', { count: profile.experienceYears })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.categories.map((catId) => {
            const cat = categories.find((c) => c.id === catId)
            return cat ? <Badge key={catId} tone="brand">{cat.name}</Badge> : null
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profile.skills.map((s) => (
            <Badge key={s} tone="neutral">{s}</Badge>
          ))}
        </div>
      </Card>

      <Card className="mt-4" animate={false}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          <IndianRupee size={14} className="text-brand-500" />
          {t('staffProfile.rateServiceArea')}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {t('staffProfile.rateServiceAreaDesc')}
        </p>
        <form onSubmit={handleSaveRates} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('staffProfile.hourlyRateLabel')}
              type="number"
              value={profile.hourlyRate ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, hourlyRate: e.target.value }))}
            />
            <Input
              label={t('staffProfile.serviceRadiusLabel')}
              type="number"
              value={profile.serviceRadiusKm ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, serviceRadiusKm: e.target.value }))}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPinned size={13} />
            {t('staffProfile.serviceRadiusNote', { km: profile.serviceRadiusKm || 0 })}
          </p>
          <Button type="submit">{ratesSaved ? <><CheckCircle2 size={16} /> {t('staffProfile.saved')}</> : t('staffProfile.saveRateRadius')}</Button>
        </form>
      </Card>

      <Card className="mt-4" animate={false}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          <User size={14} className="text-brand-500" />
          {t('staffProfile.contactDetails')}
        </h3>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <Input
            label={t('staffProfile.fullNameLabel')}
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label={t('staffProfile.phoneNumberLabel')}
            inputMode="numeric"
            maxLength={10}
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('staffProfile.cityLabel')}
              value={profile.city}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
            />
            <Input
              label={t('staffProfile.areaLabel')}
              value={profile.area}
              onChange={(e) => setProfile((p) => ({ ...p, area: e.target.value }))}
            />
          </div>
          <Input
            label={t('staffProfile.skillsLabel')}
            placeholder={t('staffProfile.skillsPlaceholder')}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
          <Input
            label={t('staffProfile.experienceYearsLabel')}
            type="number"
            value={profile.experienceYears ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, experienceYears: e.target.value }))}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">{t('staffProfile.serviceCategoriesLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    profile.categories.includes(cat.id)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-slate-900/[0.025] text-slate-500 hover:border-brand-600/40 hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit">{saved ? <><CheckCircle2 size={16} /> {t('staffProfile.saved')}</> : t('staffProfile.saveChanges')}</Button>
        </form>
      </Card>

      <Card className="mt-4" animate={false}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          <FileText size={14} className="text-brand-500" />
          {t('staffProfile.documentsTitle')}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{t('staffProfile.documentsDesc')}</p>
        <form onSubmit={handleSaveDocuments} className="mt-4 space-y-3">
          {profile.documents.length === 0 && (
            <p className="text-sm text-slate-400">{t('staffProfile.noDocuments')}</p>
          )}
          {profile.documents.map((doc) => (
            <div key={doc.id} className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-end">
              <Input
                label={t('staffProfile.documentTypeLabel')}
                placeholder={t('staffProfile.documentTypePlaceholder')}
                className="sm:flex-1"
                value={doc.type}
                onChange={(e) => updateDocument(doc.id, { type: e.target.value })}
              />
              <Input
                label={t('staffProfile.documentFileLabel')}
                type="file"
                className="sm:flex-1"
                onChange={(e) => updateDocument(doc.id, { fileName: e.target.files[0]?.name || '' })}
              />
              <button
                type="button"
                onClick={() => removeDocument(doc.id)}
                className="cursor-pointer self-end rounded-lg p-2.5 text-slate-400 hover:bg-rose-600/12 hover:text-rose-600 sm:self-center"
                aria-label={t('staffProfile.removeDocument')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDocument}
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <Plus size={16} /> {t('staffProfile.addDocument')}
          </button>
          <div>
            <Button type="submit">{docsSaved ? <><CheckCircle2 size={16} /> {t('staffProfile.saved')}</> : t('staffProfile.saveDocuments')}</Button>
          </div>
        </form>
      </Card>

      <Card className="mt-4" animate={false}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          <MessageSquareText size={14} className="text-brand-500" />
          {t('staffProfile.reviewsTitle')}
        </h3>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">{t('staffProfile.noReviews')}</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/70">
            {reviews.map((b) => (
              <li key={b.id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1 text-sm font-medium text-gold-500">
                    <Star size={13} fill="currentColor" /> {b.review.rating}.0
                  </p>
                  <p className="text-xs text-slate-400">{b.serviceName}</p>
                </div>
                {b.review.comment && <p className="mt-1 text-sm text-slate-600">{b.review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
