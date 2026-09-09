import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  MapPin,
  ArrowUpRight,
  Sparkles,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { categoriesApi } from '../../lib/mockApi'
import { getCategoryIcon, getCategoryEmoji } from '../../lib/icons'
import { getCategoryPhotoUrl } from '../../lib/categoryImages'
import { useSession } from '../../lib/session'
import { ROLE_HOME } from '../../app/roleConfig'
import Button from '../ui/Button'
import LanguageSwitcher from './LanguageSwitcher'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, collapse, stagger, fadeUp } from '../../lib/motion'

const LOCATIONS = ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Bengaluru', 'Chennai', 'Mumbai']

/**
 * Public header.
 *
 * At the top of a page the bar is invisible — the hero owns the screen. Once the
 * page scrolls it condenses into a floating glass rail so the canvas keeps
 * running underneath it. The active link is marked by a shared-layout pill that
 * slides between items rather than four separate fade transitions.
 */
export default function SplashNav() {
  const { t } = useTranslation()
  const categories = categoriesApi.listSync()
  const { session } = useSession()
  const location = useLocation()

  const [condensed, setCondensed] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)

  const { scrollY } = useScroll()
  // Left running while the drawer is open, this can flip the header's own
  // background/blur transition mid-open — that repaint, half-visible through
  // the backdrop, is what read as flicker. Freezing it while `mobileOpen` is
  // true removes the interaction entirely.
  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!mobileOpen) setCondensed(y > 24)
  })

  // Closing on mouseleave immediately makes the menu vanish while the cursor is
  // still crossing the gap between the trigger and the dropdown. A short delay
  // (cancelled if the cursor re-enters either element) fixes that without
  // changing anything for a deliberate move away.
  const servicesCloseTimer = useRef(null)
  const locationCloseTimer = useRef(null)

  function openServices() {
    clearTimeout(servicesCloseTimer.current)
    setServicesOpen(true)
  }
  function scheduleCloseServices() {
    servicesCloseTimer.current = setTimeout(() => setServicesOpen(false), 250)
  }
  function openLocation() {
    clearTimeout(locationCloseTimer.current)
    setLocationOpen(true)
  }
  function scheduleCloseLocation() {
    locationCloseTimer.current = setTimeout(() => setLocationOpen(false), 250)
  }

  // A full-screen menu that survives navigation would trap the user on the new
  // page behind an overlay. Reconciled during render rather than in an effect,
  // so the menu is already closed on the first paint of the new route instead
  // of flashing over it for a frame.
  const [routeAtOpen, setRouteAtOpen] = useState(location.pathname)
  if (routeAtOpen !== location.pathname) {
    setRouteAtOpen(location.pathname)
    if (mobileOpen) setMobileOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navLinkClass = ({ isActive }) =>
    cn(
      'relative rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300',
      isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
    )

  return (
    <>
      <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.div
          animate={{
            backgroundColor: condensed ? 'rgba(251,249,246,0.9)' : 'rgba(251,249,246,0)',
            borderColor: condensed ? 'rgba(231,225,217,1)' : 'rgba(231,225,217,0)',
            boxShadow: condensed
              ? '0 10px 34px -20px rgba(35,31,32,0.35)'
              : '0 0 0 0 rgba(35,31,32,0)',
          }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          // Blur is real GPU cost, paid on every scroll frame while this bar
          // is stuck to the top. It's only visible once the bar has a
          // translucent fill to frost, so it's off entirely at the top of the
          // page — and even condensed, `md` reads as the same frosted glass
          // for a fraction of what `xl` cost.
          className={cn(
            'pointer-events-auto mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border px-3 sm:px-4',
            condensed && 'backdrop-blur-md'
          )}
        >
          <Link to="/" className="flex shrink-0 items-center" aria-label="Book My Carer">
            <motion.img
              src="/brand/wordmark.png"
              alt="Book My Carer"
              className="h-10 w-auto sm:h-11"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            <NavLink to="/" className={navLinkClass} end>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full border border-brand-600/30 bg-brand-600/12"
                      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    />
                  )}
                  {t('nav.home')}
                </>
              )}
            </NavLink>

            <div className="relative" onMouseEnter={openServices} onMouseLeave={scheduleCloseServices}>
              <button
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300',
                  servicesOpen ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t('nav.careTypeServices')}
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-300', servicesOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="glass absolute left-1/2 top-full z-50 mt-3 w-[46rem] -translate-x-1/2 rounded-3xl p-3"
                  >
                    <motion.div
                      variants={stagger(0.035)}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-4 gap-1"
                    >
                      {categories.map((cat) => {
                        const Icon = getCategoryIcon(cat.icon)
                        return (
                          <motion.div key={cat.id} variants={fadeUp}>
                            <Link
                              to={`/services/${cat.slug}`}
                              className="group flex h-full flex-col gap-2.5 rounded-2xl p-3 transition-colors duration-300 hover:bg-slate-900/[0.035]"
                            >
                              <span className="relative h-16 overflow-hidden rounded-xl">
                                <img
                                  src={getCategoryPhotoUrl(cat.icon, { w: 260, q: 60 })}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-cover grayscale-[0.5] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                />
                                <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
                                <span className="absolute bottom-1.5 left-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/25 bg-ink/55 text-white backdrop-blur">
                                  <Icon size={14} />
                                </span>
                              </span>
                              <span className="text-[13px] font-semibold leading-snug text-slate-800 transition-colors group-hover:text-slate-900">
                                {cat.name}
                              </span>
                              <span className="mt-auto font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                {cat.services.length} {t('nav.servicesCount')}
                              </span>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </motion.div>

                    <Link
                      to="/services"
                      className="mt-1 flex items-center justify-between rounded-2xl border border-line bg-slate-900/[0.025] px-4 py-3 text-[13px] font-semibold text-slate-700 transition-colors hover:border-brand-600/40 hover:text-brand-700"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles size={14} className="text-brand-500" />
                        {t('browse.viewAll')}
                      </span>
                      <ArrowUpRight size={15} />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" onMouseEnter={openLocation} onMouseLeave={scheduleCloseLocation}>
              <button
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300',
                  locationOpen ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <MapPin size={13} />
                {t('nav.location')}
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-300', locationOpen && 'rotate-180')}
                />
              </button>
              <AnimatePresence>
                {locationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                    className="glass absolute left-0 top-full z-50 mt-3 w-60 rounded-2xl p-1.5"
                  >
                    {LOCATIONS.map((loc, i) => (
                      <motion.button
                        key={loc}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE_OUT_EXPO }}
                        className="group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-900/[0.04] hover:text-slate-900"
                      >
                        {loc}
                        <ArrowUpRight
                          size={13}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher />
            {session ? (
              <Link to={ROLE_HOME[session.role]}>
                <Button size="sm" variant="secondary">
                  {t('nav.dashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/become-a-caregiver" className="hidden xl:block">
                  <Button size="sm" variant="ghost">
                    {t('nav.becomeACaregiver')}
                  </Button>
                </Link>
                <Link to="/login/staff">
                  <Button size="sm" variant="outline">
                    {t('nav.caregiverLogin')}
                  </Button>
                </Link>
                <Link to="/login/user">
                  <Button size="sm" variant="primary">
                    {t('nav.loginBookNow')}
                    <ArrowUpRight size={15} />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-slate-900/[0.03] text-slate-700 transition-colors hover:border-brand-600/40 hover:text-brand-700 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t('sidebar.openMenu')}
          >
            <Menu size={19} />
          </button>
        </motion.div>
      </header>

      {/* Mobile: a narrow, light, compact panel — no dark theme, no giant
          type, no icon-in-a-box rows. A thin brand-red rule at the top is
          the only colour move; everything else is small text on hairline
          dividers, which is what keeps a menu with three expandable
          sections from feeling heavier than it is. Still opacity/transform
          only (no clip-path, no animated blur), so it stays flicker-free. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden">
            {/* A backdrop this translucent let the page's own animated glow
                blobs and gradients keep moving underneath it, tinted but
                still visibly shifting — that's what read as flicker,
                especially mid-transition. Opaque enough hides that
                entirely; matching duration/ease with the panel means the
                two layers settle on the same frame instead of visibly
                trailing each other. */}
            <motion.div
              aria-hidden
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } }}
              transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}
            />

            <motion.div
              className="absolute right-0 top-0 flex h-full w-[78%] max-w-xs flex-col bg-surface shadow-[-20px_0_50px_-24px_rgba(35,31,32,0.45)]"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%', transition: { duration: 0.3, ease: EASE_OUT_EXPO } }}
              transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}
            >
              <div className="h-[3px] shrink-0 bg-gradient-to-r from-brand-600 to-brand-400" />

              <div className="flex h-13 shrink-0 items-center justify-between border-b border-line px-4">
                <img src="/brand/wordmark.png" alt="Book My Carer" className="h-7 w-auto" />
                <div className="flex items-center gap-1.5">
                  <LanguageSwitcher iconOnly />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-900/[0.05] hover:text-slate-900"
                    aria-label={t('sidebar.closeMenu')}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <motion.nav
                variants={stagger(0.04, 0.06)}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto px-4"
              >
                <motion.div variants={fadeUp} className="border-b border-line">
                  <Link to="/" className="group flex items-center justify-between py-3">
                    <span className="text-sm font-semibold text-slate-800">{t('nav.home')}</span>
                    <ChevronRight
                      size={14}
                      className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-600"
                    />
                  </Link>
                </motion.div>

                <motion.div variants={fadeUp} className="border-b border-line">
                  <button
                    onClick={() => setMobileSection(mobileSection === 'services' ? null : 'services')}
                    className="flex w-full cursor-pointer items-center justify-between py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {t('nav.careTypeServices')}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'shrink-0 text-slate-400 transition-transform duration-300',
                        mobileSection === 'services' && 'rotate-180'
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileSection === 'services' && (
                      <motion.div
                        variants={collapse}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-1.5 pb-3">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              to={`/services/${cat.slug}`}
                              className="flex items-center gap-1.5 rounded-lg border border-line bg-slate-900/[0.02] px-2 py-2 text-[11px] font-medium leading-snug text-slate-600 transition-colors hover:border-brand-600/30 hover:bg-brand-600/[0.04] hover:text-slate-900"
                            >
                              <span className="shrink-0 text-xs">{getCategoryEmoji(cat.icon)}</span>
                              <span className="line-clamp-2">{cat.name}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={fadeUp} className="border-b border-line">
                  <button
                    onClick={() => setMobileSection(mobileSection === 'location' ? null : 'location')}
                    className="flex w-full cursor-pointer items-center justify-between py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800">{t('nav.location')}</span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'shrink-0 text-slate-400 transition-transform duration-300',
                        mobileSection === 'location' && 'rotate-180'
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileSection === 'location' && (
                      <motion.div
                        variants={collapse}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-1.5 pb-3">
                          {LOCATIONS.map((loc) => (
                            <span
                              key={loc}
                              className="inline-flex items-center gap-1 rounded-full border border-line bg-slate-900/[0.02] px-2.5 py-1 text-[10.5px] font-medium text-slate-600"
                            >
                              <MapPin size={10} className="text-slate-400" />
                              {loc}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

              </motion.nav>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="shrink-0 space-y-2 border-t border-line px-4 py-3"
              >
                {session ? (
                  <Link to={ROLE_HOME[session.role]}>
                    <Button className="w-full" size="sm" variant="secondary">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login/user">
                      <Button className="w-full" size="sm" variant="primary">
                        {t('nav.loginBookNow')}
                        <ArrowUpRight size={13} />
                      </Button>
                    </Link>
                    {/* Two tints, not two identical outlines — a login and a
                        signup read as different weights of action even when
                        they're the same size, and that's what kept the pair
                        from looking like one button rendered twice. */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login/staff"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-600/20 bg-brand-600/[0.06] py-2.5 text-[12.5px] font-semibold text-brand-700 transition-colors hover:bg-brand-600/[0.11]"
                      >
                        <LogIn size={13} />
                        {t('nav.caregiverLogin')}
                      </Link>
                      <Link
                        to="/become-a-caregiver"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-slate-900/[0.03] py-2.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-900/[0.06] hover:text-slate-900"
                      >
                        <UserPlus size={13} />
                        {t('nav.becomeACaregiver')}
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
