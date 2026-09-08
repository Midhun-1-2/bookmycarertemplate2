import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

/**
 * Restrained 3D tilt. The card rotates a few degrees toward the pointer and
 * lifts slightly — enough to feel like a physical object catching the room
 * light, not enough to distort the text on it.
 *
 * `max` stays small on purpose: past ~8deg the type starts to shear and the
 * effect reads as a gimmick rather than depth.
 */
export default function Tilt({ children, className, max = 6, lift = 6, scale = 1.015, ...props }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const spring = { stiffness: 220, damping: 24, mass: 0.7 }
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring)

  function handleMove(e) {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  function reset() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900 }}
      whileHover={reduce ? undefined : { y: -lift, scale }}
      transition={spring}
      {...props}
    >
      {children}
    </motion.div>
  )
}
