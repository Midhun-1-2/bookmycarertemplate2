import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, Check } from 'lucide-react'
import { LANGUAGES } from '../../i18n'
import { cn } from '../../lib/cn'
import { dropdown, EASE_OUT_EXPO } from '../../lib/motion'

export default function LanguageSwitcher({ className = '', dark = false, openUp = false, iconOnly = false }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  // Seven languages in a floating list needs an outside-click escape; without
  // it the menu can be left hanging over whatever the user clicks next.
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={iconOnly ? current.label : undefined}
        className={cn(
          'flex cursor-pointer items-center font-semibold transition-colors duration-300',
          iconOnly ? 'h-8 w-8 justify-center rounded-full' : 'gap-2 rounded-full border px-3 py-2 text-[13px]',
          dark
            ? open
              ? 'border-brand-500/50 bg-brand-600/20 text-white'
              : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
            : open
              ? cn('border-brand-600/40 bg-brand-600/10 text-brand-700', iconOnly && 'border')
              : cn(
                  'border-line bg-slate-900/[0.025] text-slate-500 hover:border-line-strong hover:text-slate-900',
                  iconOnly && 'border'
                )
        )}
      >
        <Globe size={iconOnly ? 15 : 14} />
        {!iconOnly && current.label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdown}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              'glass absolute right-0 z-50 max-h-[60vh] w-44 overflow-y-auto rounded-2xl p-1.5',
              openUp ? 'bottom-full mb-2' : 'top-full mt-2'
            )}
          >
            {LANGUAGES.map((lang, i) => {
              const active = lang.code === i18n.language
              return (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.28, ease: EASE_OUT_EXPO }}
                  onClick={() => {
                    i18n.changeLanguage(lang.code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-brand-600/12 font-semibold text-brand-700'
                      : 'text-slate-600 hover:bg-slate-900/[0.04] hover:text-slate-900'
                  )}
                >
                  {lang.label}
                  {active && <Check size={14} />}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
