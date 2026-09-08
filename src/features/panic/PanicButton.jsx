import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { EASE_OUT_EXPO, SPRING_SOFT, SPRING_SNAPPY } from '../../lib/motion'

/**
 * Emergency alert.
 *
 * Deliberately the loudest object on screen: the danger red rather than the
 * brand red, and a slow outward pulse so it can be found without being read.
 * It still takes a confirmation step — a mis-tap must not page anyone.
 */
export default function PanicButton({ variant = 'floating' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)

  function handleClose() {
    setOpen(false)
    setTimeout(() => setSent(false), 300)
  }

  function handleTrigger() {
    setSent(true)
  }

  const trigger =
    variant === 'tab' ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-[68px] shrink-0 snap-start flex-col items-center justify-center gap-1 py-1.5"
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-rose-600/40 bg-rose-600/15 text-rose-500 transition-transform active:scale-95">
          <span
            aria-hidden
            className="absolute inset-0 animate-pulse-ring rounded-xl border border-rose-500"
          />
          <AlertTriangle size={17} />
        </span>
        <span className="line-clamp-2 max-w-[66px] text-center text-[9px] font-semibold leading-tight text-rose-500">
          {t('panic.emergencyAlertAriaLabel')}
        </span>
      </button>
    ) : (
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={SPRING_SNAPPY}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-rose-600 text-white shadow-[0_0_0_1px_rgba(240,51,63,0.4),0_10px_30px_-8px_rgba(240,51,63,0.7),0_0_60px_-18px_rgba(240,51,63,0.9)]"
        aria-label={t('panic.emergencyAlertAriaLabel')}
      >
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse-ring rounded-2xl border border-rose-500"
        />
        <AlertTriangle size={21} />
      </motion.button>
    )

  return (
    <>
      {trigger}

      <Modal
        open={open}
        onClose={handleClose}
        title={sent ? undefined : t('panic.emergencyAlertTitle')}
        className="max-w-md"
      >
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              className="flex flex-col items-center py-3 text-center"
            >
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SPRING_SOFT, delay: 0.06 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/12 text-emerald-500"
              >
                <CheckCircle2 size={30} />
              </motion.span>
              <p className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                {t('panic.alertSentTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {t('panic.alertSentMessage')}
              </p>
              <Button className="mt-6 w-full" onClick={handleClose}>
                {t('panic.close')}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm leading-relaxed text-slate-500">
                {t('panic.confirmMessage', { brand: 'Book My Carer' })}
              </p>
              <div className="mt-6 flex gap-2.5">
                <Button variant="secondary" className="flex-1" onClick={handleClose}>
                  {t('panic.cancel')}
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleTrigger}>
                  {t('panic.sendAlert')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  )
}
