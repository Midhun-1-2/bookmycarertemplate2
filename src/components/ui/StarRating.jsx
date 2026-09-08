import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { SPRING_SNAPPY } from '../../lib/motion'

export function StarRatingDisplay({ value, size = 14, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-gold-500/25 bg-gold-500/10 px-2 py-0.5 text-gold-400',
        className
      )}
    >
      <Star size={size} fill="currentColor" strokeWidth={0} />
      <span className="font-mono text-xs font-medium tabular-nums">
        {value ? value.toFixed(1) : '—'}
      </span>
    </span>
  )
}

/**
 * Interactive rating. Stars ahead of the hovered one dim and shrink slightly so
 * the eye is pulled to the value being chosen; the chosen star gets a brief
 * over-scale on click, which is the whole reward of the interaction.
 */
export default function StarRating({ value, onChange, size = 26 }) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = active >= n
        return (
          <motion.button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            animate={{ scale: on ? 1 : 0.88, opacity: on ? 1 : 0.45 }}
            whileTap={{ scale: 1.25 }}
            transition={SPRING_SNAPPY}
            className="cursor-pointer text-gold-400"
            aria-label={t('starRating.rateStars', { count: n })}
          >
            <Star size={size} fill={on ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </motion.button>
        )
      })}
    </div>
  )
}
