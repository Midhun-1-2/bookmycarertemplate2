import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PhoneOff } from 'lucide-react'
import Modal from '../../components/ui/Modal'

export default function CaregiverCallModal({ staff, open, onClose }) {
  const { t } = useTranslation()
  const [connected, setConnected] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!open) {
      setConnected(false)
      setSeconds(0)
      return
    }
    const connectTimer = setTimeout(() => setConnected(true), 1800)
    return () => clearTimeout(connectTimer)
  }, [open])

  useEffect(() => {
    if (!connected) return
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [connected])

  if (!staff) return null

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <Modal open={open} onClose={onClose} className="max-w-xs">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/12 text-xl font-semibold text-brand-700">
          {staff.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <p className="text-base font-semibold text-slate-900">{staff.name}</p>
        <p className="text-sm text-slate-500">{connected ? `${mm}:${ss}` : t('booking.calling')}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700"
          aria-label={t('booking.endCall')}
        >
          <PhoneOff size={20} />
        </button>
        <p className="mt-1 text-[11px] text-slate-400">{t('booking.callDisclaimer')}</p>
      </div>
    </Modal>
  )
}
