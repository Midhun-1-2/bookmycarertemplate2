import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { pageVariants } from '../../lib/motion'

function ScrollToTop({ pathname }) {
  // Runs once per route, after the outgoing page has already been unmounted by
  // AnimatePresence's `wait` mode — so the jump is never visible.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/**
 * Route-level crossfade. Keyed on pathname so navigating swaps the whole
 * subtree; `mode="wait"` lets the outgoing page clear before the new one rises,
 * which avoids two scrollable pages briefly stacking on top of each other.
 */
export default function PageTransition({ children, className }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className={className}
        variants={pageVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <ScrollToTop pathname={location.pathname} />
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
