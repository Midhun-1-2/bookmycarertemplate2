import { useRef } from 'react'
import { motion, useMotionValue, useMotionTemplate, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { SPRING_SNAPPY } from '../../lib/motion'

/**
 * The template's primary control.
 *
 * On a black canvas a flat fill reads as a hole, so every variant is built from
 * three stacked layers: the fill, a cursor-tracked highlight, and a hairline
 * top-edge sheen. The button also leans very slightly toward the pointer —
 * enough to feel alive under the hand, small enough that a toolbar of them
 * doesn't wobble.
 */

const variants = {
  primary:
    'bg-brand-600 text-white shadow-[0_8px_24px_-8px_rgba(221,34,43,0.7)] hover:shadow-[0_12px_34px_-8px_rgba(221,34,43,0.85)]',
  secondary:
    'bg-slate-900/[0.04] text-slate-900 border border-line hover:bg-slate-900/[0.07] hover:border-line-strong',
  outline:
    'border border-brand-600/45 text-brand-700 bg-brand-600/[0.06] hover:bg-brand-600/[0.14] hover:border-brand-600/80',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/[0.05]',
  danger:
    'bg-rose-600 text-white shadow-[0_8px_24px_-8px_rgba(240,51,63,0.7)] hover:shadow-[0_12px_34px_-8px_rgba(240,51,63,0.85)]',
}

const sizes = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-xl',
}

// Variants whose fill is dark enough that a white highlight would wash it out.
const LIGHT_SHEEN = new Set(['primary', 'danger'])

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  magnetic = true,
  ...props
}) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const tx = useSpring(0, { stiffness: 300, damping: 20, mass: 0.5 })
  const ty = useSpring(0, { stiffness: 300, damping: 20, mass: 0.5 })

  const highlight = useMotionTemplate`radial-gradient(120px circle at ${mx}px ${my}px, ${
    LIGHT_SHEEN.has(variant) ? 'rgba(255,255,255,0.3)' : 'rgba(221,34,43,0.14)'
  }, transparent 70%)`

  function handleMove(e) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
    if (magnetic && !reduce) {
      tx.set(((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 3.5)
      ty.set(((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 3)
    }
  }

  function handleLeave() {
    mx.set(-200)
    my.set(-200)
    tx.set(0)
    ty.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ x: tx, y: ty }}
      whileTap={{ scale: 0.965 }}
      transition={SPRING_SNAPPY}
      className={cn(
        'group/btn relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden font-semibold tracking-[-0.01em] transition-[background-color,border-color,box-shadow,color] duration-300 disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Cursor highlight. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
        style={{ background: highlight }}
      />
      {/* Top-edge light — the single detail that stops fills reading as holes. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      {children}
    </motion.button>
  )
}
