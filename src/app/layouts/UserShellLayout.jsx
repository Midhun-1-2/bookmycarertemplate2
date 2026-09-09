import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { LogOut, Bell, LayoutDashboard, CalendarClock, UserCog } from 'lucide-react'
import { useSession } from '../../lib/session'
import Footer from '../../components/layout/Footer'
import ChatbotWidget from '../../features/chatbot/ChatbotWidget'
import PanicButton from '../../features/panic/PanicButton'
import BottomNav from '../../components/layout/BottomNav'
import PageTransition from '../../components/motion/PageTransition'
import ScrollProgress from '../../components/motion/ScrollProgress'
import { cn } from '../../lib/cn'
import { SPRING_SOFT } from '../../lib/motion'

const NAV = [
  { to: '/user/dashboard', label: 'dashboardLayout.title', icon: LayoutDashboard },
  { to: '/user/bookings', label: 'userShell.myBookings', icon: CalendarClock },
  { to: '/user/profile', label: 'userShell.profile', icon: UserCog },
]

export default function UserShellLayout() {
  const { t } = useTranslation()
  const { session, logout } = useSession()
  const navigate = useNavigate()

  function handleLogout() {
    navigate('/')
    logout()
  }

  return (
    <div className="flex min-h-svh flex-col pb-24 lg:pb-0">
      <ScrollProgress />

      <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/user/dashboard" className="flex shrink-0 items-center">
            <img src="/brand/wordmark.png" alt="Book My Carer" className="h-10 w-auto sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-300',
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="usershell-active"
                        className="absolute inset-0 -z-10 rounded-full border border-brand-600/30 bg-brand-600/12"
                        transition={SPRING_SOFT}
                      />
                    )}
                    <item.icon size={15} />
                    {t(item.label)}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-slate-900/[0.025] text-slate-500 transition-colors hover:border-line-strong hover:text-slate-900"
              aria-label={t('topbar.notifications')}
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-600 shadow-[0_0_8px_rgba(221,34,43,0.9)]" />
            </button>

            <div className="hidden items-center gap-2.5 rounded-xl border border-line bg-slate-900/[0.025] py-1.5 pl-2 pr-3 lg:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600/15 font-mono text-[11px] font-semibold text-brand-700">
                {(session?.name ?? '?').charAt(0).toUpperCase()}
              </span>
              <div className="text-right">
                <p className="text-[13px] font-semibold leading-tight text-slate-800">
                  {session?.name}
                </p>
                <p className="font-mono text-[10px] leading-tight text-slate-400">
                  {session?.phone}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-line bg-slate-900/[0.025] text-rose-500 transition-colors hover:border-rose-600/40"
              aria-label={t('sidebar.logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
      <ChatbotWidget raised />
      <div className="hidden lg:block">
        <PanicButton />
      </div>
      <BottomNav
        items={[NAV[0], NAV[1], { key: 'panic', render: <PanicButton variant="tab" /> }, NAV[2]]}
      />
    </div>
  )
}
