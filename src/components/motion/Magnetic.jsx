import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Pointer-magnetism: the element leans toward the cursor while it is inside a
 * padded hit area, then springs home when the pointer leaves. Movement is
 * capped at `strength` px so buttons stay where the eye expects them.
 *
 * Springs (not tweens) so an interrupted gesture never snaps.
 */
export default function Magnetic({ children, strength = 10, className, as = 'div', ...props }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 })

  function handleMove(e) {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    // Normalise by half-extent so the pull is proportional, not absolute.
    x.set(Math.max(-1, Math.min(1, dx / (rect.width / 2))) * strength)
    y.set(Math.max(-1, Math.min(1, dy / (rect.height / 2))) * strength)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  const Comp = motion[as] ?? motion.div

  return (
    <Comp
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      {...props}
    >
      {children}
    </Comp>
  )
}
