import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { usePendingCaregivers } from '../../lib/usePendingCaregivers'
import { SPRING_SOFT } from '../../lib/motion'

/**
 * Mobile tab bar — a floating glass rail rather than a bar welded to the screen
 * edge, so the page's ambient glow keeps running beneath it.
 *
 * The active tab is a shared-layout ember pill that travels between tabs; the
 * icon lifts and the label brightens in step with it.
 */
function Tab({ to, label, icon: Icon, count = 0 }) {
  const { t } = useTranslation()

  return (
    <NavLink
      to={to}
      className="relative flex min-w-[68px] shrink-0 snap-start flex-col items-center justify-center gap-1 py-1.5"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="bottomnav-active"
              className="absolute inset-x-1 inset-y-0 -z-10 rounded-2xl border border-brand-600/30 bg-brand-600/14"
              transition={SPRING_SOFT}
            />
          )}
          <motion.span
            animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.06 : 1 }}
            transition={SPRING_SOFT}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-300',
              isActive ? 'text-brand-700' : 'text-slate-400'
            )}
          >
            <Icon size={18} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 font-mono text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </motion.span>
          <span
            className={cn(
              'line-clamp-2 max-w-[66px] text-center text-[9px] font-semibold leading-tight tracking-wide transition-colors duration-300',
              isActive ? 'text-slate-900' : 'text-slate-400'
            )}
          >
            {t(label)}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function BottomNav({ items }) {
  const { t } = useTranslation()
  const pendingCaregivers = usePendingCaregivers()
  const badgeCounts = { pendingCaregivers: pendingCaregivers.length }

  return (
    <motion.nav
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...SPRING_SOFT, delay: 0.2 }}
      // `fixed` + a heavy blur is the worst combination for scroll smoothness:
      // it re-renders the blur under this bar on every single scroll frame,
      // for as long as the user is on a mobile screen. `md` keeps the frosted
      // look at a small fraction of the cost; the higher fill opacity keeps
      // it reading solid despite the lighter blur.
      className="fixed inset-x-3 bottom-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.4rem))] z-30 rounded-3xl border border-line bg-surface/97 shadow-[0_18px_40px_-18px_rgba(35,31,32,0.4)] backdrop-blur-md lg:hidden"
      aria-label={t('sidebar.menu')}
    >
      <div className="no-scrollbar flex snap-x snap-mandatory items-stretch justify-around gap-0.5 overflow-x-auto px-2 py-2">
        {items.map((item, i) =>
          item.render ? (
            <div key={item.key ?? i} className="contents">
              {item.render}
            </div>
          ) : (
            <Tab key={item.to} {...item} count={item.badge ? badgeCounts[item.badge] ?? 0 : 0} />
          )
        )}
      </div>
    </motion.nav>
  )
}
