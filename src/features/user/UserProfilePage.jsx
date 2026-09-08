import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Phone, MapPin, FileText, IndianRupee, CheckCircle2, ShieldCheck, BadgeCheck, CalendarClock } from 'lucide-react'
import { bookingsApi, usersApi } from '../../lib/mockApi'
import { useSession } from '../../lib/session'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/dashboard/PageHeader'

export default function UserProfilePage() {
  const { t } = useTranslation()
  const { session } = useSession()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [saved, setSaved] = useState(false)
  const [aadharInput, setAadharInput] = useState('')
  const [aadharError, setAadharError] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    async function load() {
      const p = await usersApi.get(session.id)
      setProfile(p)
      const all = await bookingsApi.list()
      setBookings(all.filter((b) => b.userId === session.id))
    }
    load()
  }, [session.id])

  async function handleSave(e) {
    e.preventDefault()
    await usersApi.update(session.id, profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleVerifyAadhar(e) {
    e.preventDefault()
    setAadharError('')
    if (!/^\d{12}$/.test(aadharInput)) {
      setAadharError(t('userProfile.aadharError'))
      return
    }
    setVerifying(true)
    await new Promise((r) => setTimeout(r, 1200))
    const updated = await usersApi.update(session.id, {
      aadharLast4: aadharInput.slice(-4),
      aadharVerified: true,
    })
    setProfile(updated)
    setVerifying(false)
  }

  if (!profile) return null

  const invoices = bookings.filter((b) => b.payment.status === 'paid')
  const totalSpent = invoices.reduce((sum, b) => sum + b.payment.amount, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={t('userProfile.title')} subtitle={t('userProfile.subtitle')} />

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card animate={false} className="text-center">
          <p className="flex items-center justify-center gap-1 text-xl font-semibold text-brand-700">
            <CalendarClock size={16} /> {bookings.length}
          </p>
          <p className="text-xs text-slate-500">{t('userProfile.bookingsLabel')}</p>
        </Card>
        <Card animate={false} className="text-center">
          <p className="flex items-center justify-center gap-1 text-xl font-semibold text-brand-700">
            <FileText size={16} /> {invoices.length}
          </p>
          <p className="text-xs text-slate-500">{t('userProfile.invoicesLabel')}</p>
        </Card>
        <Card animate={false} className="text-center">
          <p className="flex items-center justify-center gap-1 text-xl font-semibold text-brand-700">
            <IndianRupee size={16} /> {totalSpent}
          </p>
          <p className="text-xs text-slate-500">{t('userProfile.totalSpentLabel')}</p>
        </Card>
      </div>

      <Card className="mt-5" animate={false}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          <User size={14} className="text-brand-500" />
          {t('userProfile.personalDetails')}
        </h3>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <Input
            label={t('userProfile.fullName')}
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
          <Input label={t('userProfile.phoneNumber')} value={profile.phone} disabled />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('userProfile.city')}
              value={profile.city}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
            />
            <Input
              label={t('userProfile.area')}
              value={profile.area}
              onChange={(e) => setProfile((p) => ({ ...p, area: e.target.value }))}
            />
          </div>
          <Button type="submit">{saved ? <><CheckCircle2 size={16} /> {t('userProfile.saved')}</> : t('userProfile.saveChanges')}</Button>
        </form>
      </Card>

      <Card className="mt-5" animate={false}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          <ShieldCheck size={14} className="text-brand-500" />
          {t('userProfile.identityVerification')}
        </h3>
        {profile.aadharVerified ? (
          <div className="mt-3 flex items-center gap-2">
            <Badge tone="success">
              <BadgeCheck size={12} className="mr-1 inline" />
              {t('userProfile.aadharVerified')}
            </Badge>
            <span className="text-sm text-slate-500">•••• •••• {profile.aadharLast4}</span>
          </div>
        ) : (
          <form onSubmit={handleVerifyAadhar} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label={t('userProfile.aadharNumber')}
              placeholder={t('userProfile.aadharPlaceholder')}
              inputMode="numeric"
              maxLength={12}
              value={aadharInput}
              onChange={(e) => setAadharInput(e.target.value.replace(/\D/g, ''))}
              error={aadharError}
              className="flex-1"
            />
            <Button type="submit" disabled={verifying} className="sm:mb-0">
              {verifying ? t('userProfile.verifying') : t('userProfile.verify')}
            </Button>
          </form>
        )}
      </Card>

      <Card className="mt-5" animate={false}>
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
          <FileText size={14} className="text-brand-500" />
          {t('userProfile.invoices')}
        </h3>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">{t('userProfile.noInvoices')}</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/70">
            {invoices.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{b.serviceName}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <Phone size={11} /> {b.contactPhone} &nbsp;
                    <MapPin size={11} /> {b.startDate}
                  </p>
                </div>
                <p className="flex items-center font-semibold text-brand-700">
                  <IndianRupee size={13} />
                  {b.payment.amount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
