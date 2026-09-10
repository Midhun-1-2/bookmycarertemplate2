import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  Menu,
  X,
  MapPin,
  ArrowUpRight,
  Sparkles,
  LogIn,
  UserPlus,
  Home as HomeIcon,
  LayoutGrid,
} from 'lucide-react'
import { categoriesApi } from '../../lib/mockApi'
import { getCategoryIcon } from '../../lib/icons'
import { getCategoryPhotoUrl } from '../../lib/categoryImages'
import { useSession } from '../../lib/session'
import { ROLE_HOME } from '../../app/roleConfig'
import Button from '../ui/Button'
import LanguageSwitcher from './LanguageSwitcher'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, stagger, fadeUp } from '../../lib/motion'

const LOCATIONS = ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Bengaluru', 'Chennai', 'Mumbai']
const MOBILE_TAB_ORDER = ['services', 'location']

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
  const [mobileTab, setMobileTab] = useState('services')
  const [tabDirection, setTabDirection] = useState(1)

  // Slide direction follows the tab's position left-to-right, so switching
  // reads as moving along a strip rather than an arbitrary crossfade.
  function selectMobileTab(key) {
    setTabDirection(MOBILE_TAB_ORDER.indexOf(key) > MOBILE_TAB_ORDER.indexOf(mobileTab) ? 1 : -1)
    setMobileTab(key)
  }

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

      {/* Mobile: a bottom sheet, not a side drawer — a different silhouette,
          a different opening direction, and a different content pattern
          (segmented tabs instead of stacked accordions) from every earlier
          pass at this menu. Still light, still small type, still opacity /
          transform only so it stays flicker-free. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              aria-hidden
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } }}
              transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}
            />

            {/* Enter/exit share the backdrop's exact duration and ease — a
                spring here settles on its own clock, arriving before (or
                after) the backdrop finishes fading and reading as a stutter.
                Matching curves is what makes both layers land on the same
                frame instead of visibly trailing each other. */}
            <motion.div
              className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-hidden rounded-t-[26px] bg-surface shadow-[0_-24px_60px_-24px_rgba(35,31,32,0.45)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%', transition: { duration: 0.3, ease: EASE_OUT_EXPO } }}
              transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}
            >
              <div className="flex shrink-0 justify-center pb-1 pt-2.5">
                <span className="h-1 w-9 rounded-full bg-slate-900/15" />
              </div>

              <div className="flex shrink-0 items-center justify-between px-5 pb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  {t('sidebar.menu')}
                </span>
                {/* Home moved here as a plain icon button — it doesn't need a
                    whole tab of its own, and sitting beside the language
                    control keeps the segmented row below to just the two
                    sections that actually have content to browse. */}
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/"
                    aria-label={t('nav.home')}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-slate-900/[0.025] text-slate-500 transition-all duration-150 hover:border-brand-600/30 hover:text-brand-700 active:scale-95"
                  >
                    <HomeIcon size={14} />
                  </Link>
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

              <div className="shrink-0 px-5 pb-3">
                <div className="relative flex gap-1 rounded-full bg-slate-900/[0.045] p-1">
                  {[
                    { key: 'services', label: t('nav.careTypeServices'), Icon: LayoutGrid },
                    { key: 'location', label: t('nav.location'), Icon: MapPin },
                  ].map(({ key, label, Icon }) => (
                    <motion.button
                      key={key}
                      onClick={() => selectMobileTab(key)}
                      whileTap={{ scale: 0.96 }}
                      className={cn(
                        'relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12.5px] font-semibold transition-colors duration-300',
                        mobileTab === key ? 'text-white' : 'text-slate-500'
                      )}
                    >
                      {mobileTab === key && (
                        <motion.span
                          layoutId="mobile-tab-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-ink"
                          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                        />
                      )}
                      <Icon size={13} />
                      <span className="truncate">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-4">
                <AnimatePresence mode="wait" initial={false} custom={tabDirection}>
                  {mobileTab === 'services' && (
                    <motion.div
                      key="services"
                      custom={tabDirection}
                      initial={(dir) => ({ opacity: 0, x: dir * 16 })}
                      animate={{ opacity: 1, x: 0 }}
                      exit={(dir) => ({ opacity: 0, x: -dir * 16, transition: { duration: 0.16, ease: EASE_OUT_EXPO } })}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                    >
                      {/* Plain, not a second stagger of its own — the tab
                          panel above already carries one slide/fade for the
                          whole group. Animating every card individually on
                          top of that (opacity + transform × 9 elements, all
                          inside a shadowed, rounded, overflow-hidden sheet)
                          was the real cost behind the flicker: too much
                          compositor work landing in the same frame. */}
                      <div className="flex gap-2.5 overflow-x-auto pb-1">
                        {categories.map((cat) => {
                          const Icon = getCategoryIcon(cat.icon)
                          return (
                            <Link key={cat.id} to={`/services/${cat.slug}`} className="group block w-[100px] shrink-0">
                              <span className="relative block h-20 overflow-hidden rounded-2xl">
                                <img
                                  src={getCategoryPhotoUrl(cat.icon, { w: 220, q: 60 })}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                                <span className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-white/90 text-ink">
                                  <Icon size={11} />
                                </span>
                              </span>
                              <span className="mt-1.5 block line-clamp-2 text-[11px] font-medium leading-snug text-slate-700">
                                {cat.name}
                              </span>
                            </Link>
                          )
                        })}
                        <Link
                          to="/services"
                          className="flex h-20 w-[100px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line text-center transition-colors hover:border-brand-600/40"
                        >
                          <Sparkles size={15} className="text-brand-500" />
                          <span className="text-[10.5px] font-semibold text-slate-600">
                            {t('browse.viewAll')}
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {mobileTab === 'location' && (
                    <motion.div
                      key="location"
                      custom={tabDirection}
                      initial={(dir) => ({ opacity: 0, x: dir * 16 })}
                      animate={{ opacity: 1, x: 0 }}
                      exit={(dir) => ({ opacity: 0, x: -dir * 16, transition: { duration: 0.16, ease: EASE_OUT_EXPO } })}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                      className="grid grid-cols-2 gap-2"
                    >
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          className="flex items-center gap-2 rounded-xl border border-line bg-slate-900/[0.02] px-3 py-2.5 text-left text-[12px] font-medium text-slate-600 transition-all duration-150 active:scale-[0.97] hover:border-brand-600/30 hover:text-slate-900"
                        >
                          <MapPin size={12} className="shrink-0 text-brand-500" />
                          <span className="truncate">{loc}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="shrink-0 border-t border-line px-5 py-3">
                {session ? (
                  <Link to={ROLE_HOME[session.role]}>
                    <Button className="w-full" size="sm" variant="secondary">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                ) : (
                  // A tri-tile bar rather than a stacked button + pair: the
                  // primary action keeps the only fill colour so it still
                  // reads as the default choice, while the other two sit as
                  // plain icon-over-label tiles beside it.
                  <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line">
                    <Link
                      to="/login/user"
                      className="flex flex-col items-center gap-1 bg-brand-600 px-1 py-2.5 text-white transition-all duration-150 hover:bg-brand-700 active:scale-95"
                    >
                      <ArrowUpRight size={15} />
                      <span className="text-center text-[9.5px] font-bold uppercase leading-tight tracking-wide">
                        {t('nav.loginBookNow')}
                      </span>
                    </Link>
                    <Link
                      to="/login/staff"
                      className="flex flex-col items-center gap-1 border-l border-line bg-slate-900/[0.02] px-1 py-2.5 text-slate-600 transition-all duration-150 hover:bg-slate-900/[0.05] hover:text-slate-900 active:scale-95"
                    >
                      <LogIn size={15} />
                      <span className="text-center text-[9.5px] font-bold uppercase leading-tight tracking-wide">
                        {t('nav.caregiverLogin')}
                      </span>
                    </Link>
                    <Link
                      to="/become-a-caregiver"
                      className="flex flex-col items-center gap-1 border-l border-line bg-slate-900/[0.02] px-1 py-2.5 text-slate-600 transition-all duration-150 hover:bg-slate-900/[0.05] hover:text-slate-900 active:scale-95"
                    >
                      <UserPlus size={15} />
                      <span className="text-center text-[9.5px] font-bold uppercase leading-tight tracking-wide">
                        {t('nav.becomeACaregiver')}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
