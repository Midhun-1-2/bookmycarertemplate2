import { Bell, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { EASE_OUT_EXPO } from '../../lib/motion'

/**
 * Console top bar. The section title is re-keyed on change so it swaps with a
 * short rise — the one piece of motion that tells you the route changed while
 * the sidebar and chrome stay put.
 */
export default function Topbar({ title, right, onLogout }) {
  const { t } = useTranslation()

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-void/85 px-4 backdrop-blur-md sm:px-6"
      aria-label={title}
    >
      <div className="flex min-w-0 items-center gap-3">
        <img src="/brand/wordmark.png" alt="Book My Carer" className="h-9 w-auto lg:hidden" />
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          className="hidden truncate text-lg font-semibold tracking-tight text-slate-900 lg:block"
        >
          {title}
        </motion.h2>
      </div>

      <div className="flex items-center gap-1.5">
        {right}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-slate-900/[0.025] text-slate-500 transition-colors hover:border-line-strong hover:text-slate-900"
          aria-label={t('topbar.notifications')}
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-600 shadow-[0_0_8px_rgba(221,34,43,0.9)]" />
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-line bg-slate-900/[0.025] text-rose-500 transition-colors hover:border-rose-600/40 lg:hidden"
            aria-label={t('sidebar.logout')}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  )
}
