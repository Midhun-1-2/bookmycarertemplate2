import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileText, Image as ImageIcon, Upload, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, SPRING_SNAPPY } from '../../lib/motion'

const KB = 1024
const MB = KB * KB

function formatSize(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`
  if (bytes >= KB) return `${Math.round(bytes / KB)} KB`
  return `${bytes} B`
}

/**
 * Single-file upload control.
 *
 * Empty, it is a dashed drop target — the one place in this design system that
 * breaks the hairline-border rule, because a dashed edge is what reads as "put
 * something here". Filled, it collapses into a solid paper row showing the file,
 * so a completed form is a list of facts rather than a wall of drop zones.
 *
 * Accepts both a click and a drag; the drag state is tracked with a counter
 * rather than a boolean, since dragenter/dragleave also fire for child nodes and
 * a plain boolean flickers as the pointer crosses the icon and the label.
 */
export default function FileField({
  label,
  value,
  onChange,
  required = false,
  optionalLabel,
  error,
  accept = 'image/*,.pdf',
  maxBytes = 5 * MB,
  id,
  className,
}) {
  const { t } = useTranslation()
  const reactId = useId()
  const inputId = id || reactId
  const inputRef = useRef(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  const shownError = error || localError
  const isImage = value?.type?.startsWith('image/')

  function accept_(file) {
    if (!file) return
    if (file.size > maxBytes) {
      setLocalError(t('fileField.tooLarge', { size: formatSize(maxBytes) }))
      return
    }
    setLocalError('')
    onChange(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    accept_(e.dataTransfer.files?.[0])
  }

  function clear() {
    setLocalError('')
    onChange(null)
    // Without this, re-picking the same file fires no change event.
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* The label is optional: inside a repeating document row the adjacent
          name field already titles the control, and a second label there would
          just be noise. */}
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            {label}
            {required && <span className="ml-1 text-brand-600">*</span>}
          </label>
          {!required && optionalLabel && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              {optionalLabel}
            </span>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => accept_(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait" initial={false}>
        {value ? (
          <motion.div
            key="filled"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="flex items-center gap-3 rounded-xl border border-brand-600/30 bg-brand-600/[0.06] px-3.5 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-600/25 bg-surface text-brand-700">
              {isImage ? <ImageIcon size={15} /> : <FileText size={15} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-slate-900">
                {value.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                {formatSize(value.size)}
              </span>
            </span>
            <motion.button
              type="button"
              onClick={clear}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_SNAPPY}
              className="shrink-0 cursor-pointer rounded-full border border-line bg-surface p-1.5 text-slate-400 hover:border-rose-600/40 hover:text-rose-600"
              aria-label={t('fileField.remove', { label: label || value.name })}
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            key="empty"
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault()
              dragDepth.current += 1
              setDragging(true)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {
              dragDepth.current -= 1
              if (dragDepth.current <= 0) setDragging(false)
            }}
            onDrop={handleDrop}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className={cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3.5 py-3 text-left transition-colors duration-300',
              dragging
                ? 'border-brand-600 bg-brand-600/[0.08]'
                : 'border-line-strong bg-slate-900/[0.02] hover:border-brand-600/50 hover:bg-brand-600/[0.04]',
              shownError && 'border-rose-600/60 bg-rose-600/[0.04]'
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300',
                dragging
                  ? 'border-brand-600/40 bg-brand-600/15 text-brand-700'
                  : 'border-line bg-surface text-slate-400'
              )}
            >
              <Upload size={15} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-slate-700">
                {dragging ? t('fileField.dropNow') : t('fileField.cta')}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                {t('fileField.hint', { size: formatSize(maxBytes) })}
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {shownError && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600"
          >
            <AlertCircle size={13} />
            {shownError}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
