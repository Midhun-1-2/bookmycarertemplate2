import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CreditCard, Smartphone, Landmark, CheckCircle2, IndianRupee } from 'lucide-react'
import { bookingsApi, staffApi, payForBooking } from '../../lib/mockApi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/dashboard/PageHeader'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const { bookingId } = useParams()

  const METHODS = [
    { id: 'upi', label: t('checkout.methodUpi'), icon: Smartphone },
    { id: 'card', label: t('checkout.methodCard'), icon: CreditCard },
    { id: 'netbanking', label: t('checkout.methodNetbanking'), icon: Landmark },
  ]
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [staffName, setStaffName] = useState('')
  const [method, setMethod] = useState('upi')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    async function load() {
      const b = await bookingsApi.get(bookingId)
      setBooking(b)
      if (b?.staffId) {
        const s = await staffApi.get(b.staffId)
        setStaffName(s?.name ?? '')
      }
    }
    load()
  }, [bookingId])

  async function handlePay() {
    setStatus('processing')
    await new Promise((r) => setTimeout(r, 1400))
    await payForBooking(bookingId, booking.payment.amount)
    setStatus('success')
  }

  if (!booking) return null

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <PageHeader title={t('checkout.title')} subtitle={t('checkout.subtitle')} />

      <Card className="mt-6" animate={false}>
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{booking.serviceName}</p>
            <p className="text-xs text-slate-500">{t('checkout.caregiverLabel', { name: staffName || t('checkout.assignedFallback') })}</p>
          </div>
          <p className="flex items-center text-lg font-semibold text-brand-700">
            <IndianRupee size={16} />
            {booking.payment.amount}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center"
            >
              <CheckCircle2 size={44} className="text-emerald-500" />
              <p className="mt-3 font-semibold text-slate-900">{t('checkout.paymentSuccessful')}</p>
              <p className="mt-1 text-sm text-slate-500">
                {t('checkout.successMessage')}
              </p>
              <Button className="mt-5 w-full" onClick={() => navigate(`/user/bookings/${bookingId}`)}>
                {t('checkout.viewBooking')}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                {t('checkout.choosePaymentMethod')}
              </p>
              <div className="space-y-2">
                {METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMethod(id)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium transition-colors ${
                      method === id
                        ? 'border-brand-500 bg-slate-900/[0.03] text-brand-700'
                        : 'border-line text-slate-600 hover:bg-slate-900/[0.04]'
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>
              <Button
                className="mt-5 w-full"
                size="lg"
                onClick={handlePay}
                disabled={status === 'processing'}
              >
                {status === 'processing' ? t('checkout.processing') : t('checkout.payAmount', { amount: booking.payment.amount })}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
