import { cn } from '../../lib/cn'

/**
 * Status pill. Each tone is a dark, tinted ground with a matching hairline and
 * a bright label — on black, a light chip would shout louder than the content
 * it annotates. The leading dot carries the colour so the pill still parses at
 * a glance when the row is scanned rather than read.
 */
const tones = {
  brand: 'bg-brand-600/12 text-brand-700 border-brand-600/30',
  accent: 'bg-accent-500/12 text-accent-700 border-accent-500/30',
  success: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/30',
  warning: 'bg-amber-500/12 text-amber-700 border-amber-500/30',
  danger: 'bg-rose-600/14 text-rose-700 border-rose-600/35',
  neutral: 'bg-slate-900/[0.04] text-slate-500 border-line',
}

const dots = {
  brand: 'bg-brand-500',
  accent: 'bg-accent-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
}

export default function Badge({ tone = 'brand', dot = true, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm',
        tones[tone] ?? tones.brand,
        className
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dots[tone] ?? dots.brand)}
        />
      )}
      {children}
    </span>
  )
}
