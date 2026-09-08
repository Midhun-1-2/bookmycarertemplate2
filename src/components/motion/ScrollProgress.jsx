import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Ember hairline across the very top of the viewport tracking read progress.
 * Spring-smoothed so a flicked scroll wheel doesn't make it stutter.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600 shadow-[0_0_12px_rgba(221,34,43,0.8)]"
    />
  )
}
