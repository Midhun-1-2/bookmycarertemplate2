import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, stagger, fadeUp } from '../../lib/motion'

/**
 * Console page masthead: mono eyebrow, display title, one line of context, and
 * an optional action slot on the right. Every console page opens with this so
 * the operator always knows where they are without reading the sidebar.
 */
export default function PageHeader({ eyebrow, title, subtitle, actions, className }) {
  return (
    <motion.div
      variants={stagger(0.06)}
      initial="hidden"
      animate="show"
      className={cn('mb-7 flex flex-wrap items-end justify-between gap-4', className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <motion.p variants={fadeUp} className="eyebrow flex items-center gap-2.5 text-brand-700">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className="h-px w-8 origin-left bg-gradient-to-r from-brand-600 to-transparent"
            />
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          variants={fadeUp}
          className="mt-2.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p variants={fadeUp} className="mt-2 max-w-2xl text-sm text-slate-500">
            {subtitle}
          </motion.p>
        )}
      </div>
      {actions && (
        <motion.div variants={fadeUp} className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </motion.div>
      )}
    </motion.div>
  )
}
