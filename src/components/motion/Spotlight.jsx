import { useRef } from 'react'
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion'
import { cn } from '../../lib/cn'

/**
 * A surface that lights up under the cursor: a soft ember pool follows the
 * pointer across the panel and the border picks up the same warmth. On a black
 * canvas this is what tells the eye a card is interactive — no colour change,
 * no shadow jump, just light moving.
 *
 * The pool is a separate absolutely-positioned layer so it can be masked by the
 * card's own border radius without repainting the content beneath it.
 */
export default function Spotlight({
  children,
  className,
  radius = 320,
  intensity = 0.07,
  disabled = false,
  ...props
}) {
  const ref = useRef(null)
  const mx = useMotionValue(-9999)
  const my = useMotionValue(-9999)
  const opacity = useSpring(0, { stiffness: 200, damping: 30 })

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mx}px ${my}px, rgba(221,34,43,${intensity}), transparent 72%)`
  const border = useMotionTemplate`radial-gradient(${radius * 0.8}px circle at ${mx}px ${my}px, rgba(221,34,43,0.45), transparent 68%)`

  function handleMove(e) {
    if (disabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={() => !disabled && opacity.set(1)}
      onPointerLeave={() => opacity.set(0)}
      className={cn('group relative isolate overflow-hidden', className)}
      {...props}
    >
      {/* Border light: a full-bleed gradient masked to a 1px inset frame. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-none"
        style={{
          opacity,
          background: border,
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: 1,
        }}
      />
      {/* Ember pool behind the content. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
        style={{ opacity, background }}
      />
      {children}
    </div>
  )
}
