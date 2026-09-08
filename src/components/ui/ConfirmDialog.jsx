import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { SPRING_SOFT } from '../../lib/motion'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  loading,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation()
  const destructive = tone === 'danger'

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="flex gap-4">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING_SOFT, delay: 0.08 }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            destructive
              ? 'border-rose-600/35 bg-rose-600/12 text-rose-500'
              : 'border-brand-600/35 bg-brand-600/12 text-brand-700'
          }`}
        >
          <AlertTriangle size={19} />
        </motion.span>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{message}</p>
        </div>
      </div>

      <div className="mt-7 flex justify-end gap-2.5">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel ?? t('common.cancel')}
        </Button>
        <Button type="button" variant={tone} onClick={onConfirm} disabled={loading}>
          {confirmLabel ?? t('common.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
