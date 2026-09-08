import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { SessionProvider } from './lib/session'
import AppRouter from './app/AppRouter'

function App() {
  return (
    <BrowserRouter>
      {/* `reducedMotion="user"` makes every framer animation in the tree respect
          prefers-reduced-motion, which the CSS media query in index.css cannot
          reach — JS-driven transforms are invisible to it. */}
      <MotionConfig reducedMotion="user">
        <SessionProvider>
          <AppRouter />
        </SessionProvider>
      </MotionConfig>
    </BrowserRouter>
  )
}

export default App
