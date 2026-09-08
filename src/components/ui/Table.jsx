import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO } from '../../lib/motion'

/**
 * Data table.
 *
 * No zebra striping and no vertical rules — on a dark ground those turn a table
 * into a cage. Rows are separated by a single hairline and identified on hover
 * by a warm wash plus an ember marker sliding in at the left edge, which is
 * enough to track a row across a wide, horizontally-scrolling table.
 */

export function Table({ className, children }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className={cn('w-full min-w-max text-left text-sm', className)}>{children}</table>
      </div>
    </div>
  )
}

export function TableHead({ children }) {
  return (
    <thead className="border-b border-line bg-slate-900/[0.025]">
      <tr className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
        {children}
      </tr>
    </thead>
  )
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-line/70">{children}</tbody>
}

export function Th({ children, className }) {
  return <th className={cn('whitespace-nowrap px-5 py-3.5', className)}>{children}</th>
}

export function Td({ children, className }) {
  return <td className={cn('px-5 py-4 align-middle text-slate-600', className)}>{children}</td>
}

export function Tr({ children, className, index = 0, ...props }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      // Capped so a 200-row table doesn't take twenty seconds to finish arriving.
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: Math.min(index * 0.035, 0.45) }}
      className={cn(
        'group/row relative transition-colors duration-200 hover:bg-slate-900/[0.03]',
        // The left marker lives on the first cell so it can't disturb layout.
        '[&>td:first-child]:relative',
        "[&>td:first-child]:before:absolute [&>td:first-child]:before:inset-y-1 [&>td:first-child]:before:left-0 [&>td:first-child]:before:w-[2px] [&>td:first-child]:before:origin-top [&>td:first-child]:before:scale-y-0 [&>td:first-child]:before:rounded-full [&>td:first-child]:before:bg-brand-600 [&>td:first-child]:before:transition-transform [&>td:first-child]:before:duration-300 group-hover/row:[&>td:first-child]:before:scale-y-100",
        "[&>td:first-child]:before:content-['']",
        className
      )}
      {...props}
    >
      {children}
    </motion.tr>
  )
}
