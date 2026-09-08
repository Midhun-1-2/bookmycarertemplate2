import { forwardRef, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO } from '../../lib/motion'

/**
 * Text field.
 *
 * The field itself is an inset well — darker than the surface it sits on, which
 * is how a dark UI signals "you can type here". Focus is drawn by an ember
 * underline that wipes in from the centre rather than a ring, so the control
 * stays quiet until it is being used.
 */
const Input = forwardRef(function Input(
  { label, error, hint, className, id, containerClassName, ...props },
  ref
) {
  const reactId = useId()
  const inputId = id || props.name || reactId
  const [focused, setFocused] = useState(false)

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
            focused ? 'text-brand-700' : 'text-slate-400'
          )}
        >
          {label}
          {props.required && <span className="ml-1 text-brand-600">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className={cn(
            'peer h-12 w-full rounded-xl border bg-surface px-4 text-sm text-slate-900 outline-none transition-[border-color,background-color,box-shadow] duration-300',
            'placeholder:text-slate-400/70',
            'border-line hover:border-line-strong',
            'focus:border-brand-600/70 focus:bg-surface focus:shadow-[0_0_0_4px_rgba(221,34,43,0.12)]',
            error && 'border-rose-600/70 focus:border-rose-600 focus:shadow-[0_0_0_4px_rgba(240,51,63,0.14)]',
            className
          )}
          {...props}
        />
        {/* Centre-out underline wipe on focus. */}
        <motion.span
          aria-hidden
          className={cn(
            'pointer-events-none absolute bottom-0 left-1/2 h-px w-[calc(100%-1.5rem)] -translate-x-1/2 origin-center',
            error ? 'bg-rose-500' : 'bg-brand-500'
          )}
          initial={false}
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
        />
      </div>

      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.span
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500"
          >
            <AlertCircle size={13} />
            {error}
          </motion.span>
        ) : hint ? (
          <span key="hint" className="text-xs text-slate-400">
            {hint}
          </span>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

export default Input
