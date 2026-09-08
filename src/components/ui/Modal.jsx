import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, SPRING_SNAPPY } from '../../lib/motion'

/**
 * Dialog.
 *
 * The scrim is near-opaque black plus a blur: on a dark UI a translucent grey
 * scrim reads as fog, whereas blacking the page out and letting one lit panel
 * float is unambiguous. The panel springs up rather than fading, and an ember
 * seam along its top edge ties it to the rest of the surface language.
 *
 * Body scroll is locked while open and Escape closes — both expected of a modal
 * and both easy to forget.
 */
export default function Modal({ open, onClose, title, description, children, className }) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            className={cn(
              'glass relative z-10 my-8 max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 sm:p-7',
              className
            )}
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.18 } }}
            transition={SPRING_SNAPPY}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-600/70 to-transparent"
            />

            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                {title && (
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
                )}
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-full border border-line bg-slate-900/[0.03] p-2 text-slate-400 hover:border-brand-600/40 hover:text-brand-700"
                aria-label={t('modal.close')}
              >
                <X size={16} />
              </motion.button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
