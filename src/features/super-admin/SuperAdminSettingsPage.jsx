import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Settings } from 'lucide-react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { readStore, writeStore } from '../../lib/storage'

const DEFAULTS = {
  platformName: 'Book My Carer',
  supportPhone: '9000000000',
  supportEmail: 'support@bookmycarers.in',
  escrowProvider: 'To be confirmed by client',
  maintenanceMode: false,
}

export default function SuperAdminSettingsPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState(() => readStore('settings', DEFAULTS))
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    writeStore('settings', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        <Settings size={22} className="text-brand-500" />
        {t('superAdminSettings.title')}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {t('superAdminSettings.subtitle')}
      </p>

      <Card className="mt-6" animate={false}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={t('superAdminSettings.platformName')}
            value={settings.platformName}
            onChange={(e) => setSettings((s) => ({ ...s, platformName: e.target.value }))}
          />
          <Input
            label={t('superAdminSettings.supportPhone')}
            value={settings.supportPhone}
            onChange={(e) => setSettings((s) => ({ ...s, supportPhone: e.target.value }))}
          />
          <Input
            label={t('superAdminSettings.supportEmail')}
            value={settings.supportEmail}
            onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
          />
          <Input
            label={t('superAdminSettings.escrowProvider')}
            value={settings.escrowProvider}
            onChange={(e) => setSettings((s) => ({ ...s, escrowProvider: e.target.value }))}
          />
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))}
              className="h-4 w-4 rounded border-line-strong text-brand-600 focus:ring-brand-600"
            />
            {t('superAdminSettings.maintenanceMode')}
          </label>
          <Button type="submit">{saved ? <><CheckCircle2 size={16} /> {t('superAdminSettings.saved')}</> : t('superAdminSettings.saveButton')}</Button>
        </form>
      </Card>
    </div>
  )
}
