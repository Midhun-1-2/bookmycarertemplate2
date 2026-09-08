import { useTranslation } from 'react-i18next'
import { Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import Spotlight from './motion/Spotlight'
import CountUp from './motion/CountUp'
import { totalPoints } from '../lib/rewardPoints'
import { EASE_OUT_EXPO, VIEWPORT_EARLY } from '../lib/motion'

/**
 * Reward points balance + recent accrual. `history` comes from
 * getSeekerPointsHistory / getCaregiverPointsHistory in lib/rewardPoints.
 *
 * Given a loyalty balance is the one number on these pages a person actually
 * wants to see grow, it gets the ember treatment: a warm-tinted panel, the
 * total set large in the display face, and a count-up on arrival.
 */
export default function RewardPointsCard({ history, variant = 'seeker', className = '' }) {
  const { t } = useTranslation()
  const total = totalPoints(history)
  const recent = history.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_EARLY}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className={className}
    >
      <Spotlight
        className="relative overflow-hidden rounded-2xl border border-brand-600/25 bg-gradient-to-br from-brand-600/[0.09] via-surface to-surface p-5 "
        intensity={0.1}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 animate-ember rounded-full bg-brand-600/20 blur-[60px]"
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-brand-700">
              <Gift size={13} />
              {t('rewards.title')}
            </h3>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-slate-500">
              {variant === 'caregiver'
                ? t('rewards.subtitleCaregiver')
                : t('rewards.subtitleSeeker')}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-4xl font-semibold leading-none tracking-tight text-slate-900">
              <CountUp value={total} duration={1.4} />
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
              {t('rewards.pointsLabel')}
            </p>
          </div>
        </div>

        {recent.length > 0 && (
          <ul className="relative mt-5 divide-y divide-line/70 border-t border-line/70">
            {recent.map((e, i) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VIEWPORT_EARLY}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: EASE_OUT_EXPO }}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate text-slate-500">{e.serviceName}</span>
                <span className="shrink-0 font-mono text-xs font-semibold text-brand-700">
                  {t('rewards.pointsEarned', { points: e.points })}
                </span>
              </motion.li>
            ))}
          </ul>
        )}

        <p className="relative mt-4 text-[11px] leading-relaxed text-slate-400">
          {t('rewards.futureNote')}
        </p>
      </Spotlight>
    </motion.div>
  )
}
