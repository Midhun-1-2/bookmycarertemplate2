import { Outlet } from 'react-router-dom'
import SplashNav from '../../components/layout/SplashNav'
import Footer from '../../components/layout/Footer'
import ChatbotWidget from '../../features/chatbot/ChatbotWidget'
import ScrollProgress from '../../components/motion/ScrollProgress'
import PageTransition from '../../components/motion/PageTransition'

export default function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ScrollProgress />
      <SplashNav />
      {/* The nav floats over the page, so the main region starts at the very top
          of the viewport and each page decides its own top padding. */}
      <main className="-mt-19 flex-1 pt-19">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  )
}
