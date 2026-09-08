import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { fadeUp, VIEWPORT_EARLY } from '../../lib/motion'

/**
 * The standard elevated surface.
 *
 * On black, depth cannot come from a drop shadow — there is nothing for it to
 * fall on. It comes instead from `glass`: a top-lit gradient, a hairline
 * border, and an inner highlight along the upper edge. Hovering lifts the card
 * and warms its border rather than changing its fill.
 */
export default function Card({
  className,
  children,
  animate = true,
  interactive = false,
  as = 'div',
  ...props
}) {
  const Comp = animate ? motion[as] ?? motion.div : as
  const motionProps = animate
    ? {
        variants: fadeUp,
        initial: 'hidden',
        whileInView: 'show',
        viewport: VIEWPORT_EARLY,
      }
    : {}

  return (
    <Comp
      className={cn(
        'glass relative rounded-2xl p-5',
        interactive &&
          'transition-[transform,border-color,box-shadow] duration-400 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_2px_4px_rgba(35,31,32,0.05),0_22px_44px_-24px_rgba(35,31,32,0.35)]',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  )
}
