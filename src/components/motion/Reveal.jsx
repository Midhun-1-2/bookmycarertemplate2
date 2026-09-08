import { motion } from 'framer-motion'
import { fadeUp, scaleIn, slideIn, fadeIn, stagger, VIEWPORT } from '../../lib/motion'

const PRESETS = { up: fadeUp, fade: fadeIn, scale: scaleIn, slide: slideIn }

/**
 * Scroll-triggered entrance. The workhorse of the whole template — wrap any
 * block and it rises into place once, the first time it reaches the viewport.
 *
 * `as` lets it inherit the right semantics (section, li, h2 …) instead of
 * dropping an extra div into the layout for the sake of an animation.
 */
export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration,
  custom,
  as = 'div',
  className,
  viewport = VIEWPORT,
  ...props
}) {
  const Comp = motion[as] ?? motion.div
  const preset = PRESETS[variant] ?? fadeUp

  return (
    <Comp
      className={className}
      variants={preset}
      custom={custom}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={{ delay, ...(duration ? { duration } : null) }}
      {...props}
    >
      {children}
    </Comp>
  )
}

/**
 * Parent that cascades its `Reveal`/`RevealItem` children instead of firing
 * them all on the same frame. Children must use `RevealItem` (or any variants
 * named hidden/show) so they inherit the parent's orchestration.
 */
export function RevealGroup({
  children,
  gap = 0.07,
  delay = 0,
  as = 'div',
  className,
  viewport = VIEWPORT,
  ...props
}) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp
      className={className}
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function RevealItem({ children, variant = 'up', as = 'div', className, custom, ...props }) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp className={className} variants={PRESETS[variant] ?? fadeUp} custom={custom} {...props}>
      {children}
    </Comp>
  )
}
