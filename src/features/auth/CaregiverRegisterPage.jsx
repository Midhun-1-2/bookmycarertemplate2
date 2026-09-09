import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { UserPlus, CheckCircle2, FileText, Info, ShieldCheck, HeartHandshake, Plus, X } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import FileField from '../../components/ui/FileField'
import AuthShell from './AuthShell'
import { categoriesApi, registerCaregiver } from '../../lib/mockApi'
import { getCategoryIcon } from '../../lib/icons'
import { EASE_OUT_EXPO, SPRING_SOFT, SPRING_SNAPPY } from '../../lib/motion'
import { cn } from '../../lib/cn'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  city: '',
  area: '',
  experienceYears: '0',
  categories: [],
}

/** Autocomplete hints for the document name — suggestions, not a fixed list. */
const DOCUMENT_SUGGESTIONS = [
  'caregiverRegister.docAadhaar',
  'caregiverRegister.docPan',
  'caregiverRegister.docPhoto',
  'caregiverRegister.docQualification',
  'caregiverRegister.docExperience',
  'caregiverRegister.docPolice',
]

let documentSeq = 0
function blankDocument() {
  documentSeq += 1
  return { id: `doc-${Date.now().toString(36)}-${documentSeq}`, type: '', file: null }
}

/** Framed note used for the fee, documents and success callouts. */
function Note({ icon: Icon, children, tone = 'neutral', className }) {
  const tones = {
    neutral: 'border-line bg-slate-900/[0.025] text-slate-500',
    brand: 'border-brand-600/25 bg-brand-600/[0.08] text-slate-500',
  }
  return (
    <p className={cn('flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed', tones[tone], className)}>
      <Icon size={14} className="mt-0.5 shrink-0 text-brand-700" />
      <span>{children}</span>
    </p>
  )
}

/** Small icon-led heading used to open each group of fields inside the card. */
function SectionLabel({ icon: Icon, children, action }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        <Icon size={13} className="text-brand-600" />
        {children}
      </p>
      {action}
    </div>
  )
}

export default function CaregiverRegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const categories = categoriesApi.listSync()
  const [form, setForm] = useState(emptyForm)
  // Starts with one open row so the section reads as a task rather than an
  // empty area with a button under it.
  const [documents, setDocuments] = useState(() => [blankDocument()])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function toggleCategory(catId) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(catId)
        ? f.categories.filter((c) => c !== catId)
        : [...f.categories, catId],
    }))
  }

  function updateDocument(id, patch) {
    setDocuments((docs) => docs.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function addDocument() {
    setDocuments((docs) => [...docs, blankDocument()])
  }

  function removeDocument(id) {
    // Never leave the section with nothing to type into.
    setDocuments((docs) => (docs.length === 1 ? [blankDocument()] : docs.filter((d) => d.id !== id)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{10}$/.test(form.phone)) {
      setError(t('caregiverRegister.errorPhone'))
      return
    }
    if (form.categories.length === 0) {
      setError(t('caregiverRegister.errorCategories'))
      return
    }
    // A row counts once it has both halves. A row with one half filled is a
    // half-finished thought, and silently dropping it would lose a document the
    // applicant believed they had attached.
    const complete = documents.filter((d) => d.type.trim() && d.file)
    const halfFilled = documents.filter((d) => Boolean(d.type.trim()) !== Boolean(d.file))
    if (halfFilled.length > 0) {
      setError(t('caregiverRegister.errorDocumentIncomplete'))
      return
    }
    if (complete.length === 0) {
      setError(t('caregiverRegister.errorDocuments'))
      return
    }

    setSubmitting(true)
    const result = await registerCaregiver({
      name: form.name.trim(),
      phone: form.phone,
      email: form.email.trim(),
      city: form.city.trim(),
      area: form.area.trim(),
      experienceYears: Number(form.experienceYears) || 0,
      categories: form.categories,
      skills: [],
      // Prototype storage is localStorage, which cannot hold the file bytes —
      // and the approval queue only ever reads the type and the file name. So
      // the selection is recorded as metadata, in the same shape the seeded
      // caregivers and the staff profile page already use.
      documents: complete.map((d) => ({
        id: d.id,
        type: d.type.trim(),
        fileName: d.file.name,
      })),
    })
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setDone(true)
  }

  return (
    <AuthShell wide wider>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="text-center"
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING_SOFT, delay: 0.1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/12 text-emerald-500"
            >
              <CheckCircle2 size={30} />
            </motion.span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
              {t('caregiverRegister.successTitle')}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {t('caregiverRegister.successMessage')}
            </p>
            <div className="mt-6 text-left">
              <Note icon={FileText} tone="brand">
                {t('caregiverRegister.successDocuments')}
              </Note>
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={() => navigate('/login/staff')}>
              {t('caregiverRegister.goToLogin')}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}>
            <span className="eyebrow inline-flex items-center gap-2.5 text-brand-700">
              <span className="h-px w-7 bg-gradient-to-r from-brand-600 to-transparent" />
              {t('caregiverRegister.badge')}
            </span>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-900">
              {t('caregiverRegister.heading')}
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate-500">
              {t('caregiverRegister.sub')}
            </p>

            {/* One elevated card holds the whole application — a heavier form
                than login reads better contained than loose on the canvas,
                and grouping fields under icon-led labels with hairline
                dividers keeps a long form scannable instead of a flat list. */}
            <form onSubmit={handleSubmit} className="paper mt-6 rounded-3xl p-5 sm:p-7">
              <Note icon={Info} tone="brand">
                {t('caregiverRegister.feeNote')}
              </Note>

              <div className="mt-6">
                <SectionLabel icon={UserPlus}>{t('caregiverRegister.detailsTitle')}</SectionLabel>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <Input
                    label={t('caregiverRegister.fullName')}
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <Input
                    label={t('caregiverRegister.mobile')}
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder={t('auth.mobilePlaceholder')}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))
                    }
                  />
                  <Input
                    label={t('caregiverRegister.email')}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Input
                    label={t('caregiverRegister.city')}
                    required
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                  <Input
                    label={t('caregiverRegister.area')}
                    required
                    value={form.area}
                    onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                  />
                  <Input
                    label={t('caregiverRegister.experienceYears')}
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
                  />
                </div>
              </div>

              <div className="my-6 rule-fade" />

              <div>
                <SectionLabel icon={HeartHandshake}>
                  {t('caregiverRegister.servicesOffered')}
                  <span className="ml-1 text-brand-600">*</span>
                </SectionLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const selected = form.categories.includes(cat.id)
                    const CatIcon = getCategoryIcon(cat.icon)
                    return (
                      <motion.button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        whileTap={{ scale: 0.95 }}
                        transition={SPRING_SOFT}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300',
                          selected
                            ? 'border-brand-600 bg-brand-600 text-white shadow-[0_6px_18px_-6px_rgba(221,34,43,0.8)]'
                            : 'border-line bg-slate-900/[0.025] text-slate-500 hover:border-brand-600/40 hover:text-slate-900'
                        )}
                      >
                        <CatIcon size={13} className={selected ? 'text-white' : 'text-brand-600'} />
                        {cat.name}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="my-6 rule-fade" />

              <div>
                {/* Title and "add" share a line, and each row is a single
                    strip rather than a stacked name-then-file card — the
                    fixed-slot layout this replaced cost two full field
                    heights per document; this costs one. */}
                <SectionLabel
                  icon={ShieldCheck}
                  action={
                    <button
                      type="button"
                      onClick={addDocument}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      <Plus size={13} />
                      {t('caregiverRegister.addDocument')}
                    </button>
                  }
                >
                  {t('caregiverRegister.documentsTitle')}
                </SectionLabel>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {t('caregiverRegister.documentsSubtitle')}
                </p>

                {/* Common names, offered as a datalist rather than a fixed set
                    of slots — it keeps the Admin's queue readable without
                    stopping anyone attaching a document we didn't think of. */}
                <datalist id="document-name-suggestions">
                  {DOCUMENT_SUGGESTIONS.map((key) => (
                    <option key={key} value={t(key)} />
                  ))}
                </datalist>

                <ul className="mt-3 space-y-2">
                  <AnimatePresence initial={false}>
                    {documents.map((doc, i) => (
                      <motion.li
                        key={doc.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        className="flex items-center gap-2 rounded-xl border border-line bg-slate-900/[0.015] p-2"
                      >
                        <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-slate-400">
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        <Input
                          placeholder={t('caregiverRegister.documentNamePlaceholder')}
                          list="document-name-suggestions"
                          value={doc.type}
                          onChange={(e) => updateDocument(doc.id, { type: e.target.value })}
                          className="h-11"
                          containerClassName="w-[38%] shrink-0 sm:w-1/3"
                        />

                        <div className="min-w-0 flex-1">
                          <FileField
                            compact
                            value={doc.file}
                            onChange={(file) => updateDocument(doc.id, { file })}
                          />
                        </div>

                        <motion.button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          whileHover={{ rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          transition={SPRING_SNAPPY}
                          className="shrink-0 cursor-pointer rounded-full border border-line bg-surface p-1.5 text-slate-400 hover:border-rose-600/40 hover:text-rose-600"
                          aria-label={t('caregiverRegister.removeDocument', { number: i + 1 })}
                        >
                          <X size={14} />
                        </motion.button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <Note icon={ShieldCheck} className="mt-4">
                  {t('caregiverRegister.documentsNote')}
                </Note>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 rounded-xl border border-rose-600/30 bg-rose-600/10 px-3.5 py-2.5 text-xs font-medium text-rose-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
                <UserPlus size={17} />
                {submitting ? t('caregiverRegister.submitting') : t('caregiverRegister.submit')}
              </Button>

              <p className="mt-4 text-center text-sm text-slate-500">
                {t('caregiverRegister.alreadyRegistered')}{' '}
                <Link to="/login/staff" className="font-semibold text-brand-700 hover:underline">
                  {t('caregiverRegister.logInHere')}
                </Link>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
