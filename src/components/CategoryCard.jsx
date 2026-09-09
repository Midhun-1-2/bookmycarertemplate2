import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getCategoryEmoji, getCategoryTint } from '../lib/icons'
import { SPRING_SOFT } from '../lib/motion'
import { cn } from '../lib/cn'

/**
 * Category tile.
 *
 * A flat catalogue card rather than a photo tile — a pastel emoji badge reads
 * faster across a grid of eight than a monochrome glyph would, and the muted
 * service line under the description carries the "what's actually in here"
 * job a photo used to. The arrow only appears on hover, next to the title,
 * rather than living as a separate "explore" line at the bottom.
 */
export default function CategoryCard({ category, showServices = false }) {
  const emoji = getCategoryEmoji(category.icon)
  const tint = getCategoryTint(category.icon)
  const tagline = category.services
    .slice(0, 2)
    .map((s) => s.name)
    .join(' · ')

  return (
    <motion.div whileHover={{ y: -4 }} transition={SPRING_SOFT} className="h-full">
      <Link
        to={`/services/${category.slug}`}
        className="group glass flex h-full flex-col rounded-3xl p-6 transition-[border-color,box-shadow] duration-400 hover:border-brand-600/35 hover:shadow-[0_2px_4px_rgba(35,31,32,0.05),0_22px_44px_-24px_rgba(35,31,32,0.35)]"
      >
        <span
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl',
            tint
          )}
        >
          {emoji}
        </span>

        <h3 className="mt-5 flex items-center gap-1.5 text-lg font-semibold leading-snug tracking-tight text-slate-900">
          {category.name}
          <ArrowUpRight
            size={16}
            className="shrink-0 -translate-x-1 text-brand-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {category.description}
        </p>

        {tagline && <p className="mt-3 text-xs font-medium text-slate-400">{tagline}</p>}

        {showServices && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {category.services.slice(0, 3).map((s) => (
              <li
                key={s.id}
                className="rounded-full border border-line bg-slate-900/[0.025] px-2.5 py-1 text-[11px] font-medium text-slate-500"
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </motion.div>
  )
}
