import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ShieldCheck, Clock, Star } from 'lucide-react'
import { HERO_PHOTO_URL } from '../../lib/categoryImages'
import MinimalFooter from '../../components/layout/MinimalFooter'
import { EASE_OUT_EXPO, stagger, fadeUp } from '../../lib/motion'

/**
 * Split-screen frame shared by sign-in and caregiver registration.
 *
 * The left half is a full-bleed brand panel — photography sunk under an ember
 * wash with the promise set over it — and the right half is the form, on plain
 * canvas with no card around it. Keeping the form uncontained is what makes the
 * screen feel like an entrance rather than a dialog.
 *
 * On anything below `lg` the brand panel is dropped entirely: on a phone it
 * would push the actual task below the fold.
 */
export default function AuthShell({ children, wide = false, wider = false }) {
  const { t } = useTranslation()

  const POINTS = [
    { icon: ShieldCheck, label: t('trust.verified') },
    { icon: Clock, label: t('trust.flexible') },
    { icon: Star, label: t('trust.rated') },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ---------- Brand panel ---------- */}
        {/* `sticky` + its own `h-svh` keep this panel pinned at one viewport
            tall regardless of how long the form beside it runs — without it,
            a flex row stretches both children to match the taller one, and a
            long form drags this into a giant, mostly-empty slab. */}
        <aside className="relative hidden w-[38%] shrink-0 self-start overflow-hidden bg-ink lg:sticky lg:top-0 lg:block lg:h-svh">
          <motion.img
            src={HERO_PHOTO_URL}
            alt=""
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: EASE_OUT_EXPO }}
            className="absolute inset-0 h-full w-full object-cover opacity-75 grayscale-[35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink/50 via-transparent to-brand-600/20" />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 animate-drift rounded-full bg-brand-600/35 blur-[110px]"
          />

          <motion.div
            variants={stagger(0.09, 0.15)}
            initial="hidden"
            animate="show"
            className="relative flex h-full flex-col justify-between p-10 xl:p-14"
          >
            <motion.div variants={fadeUp}>
              <Link to="/" className="inline-block">
                <img src="/brand/wordmark.png" alt="Book My Carer" className="h-12 w-auto brightness-0 invert" />
              </Link>
            </motion.div>

            <div>
              <motion.p variants={fadeUp} className="eyebrow text-brand-400">
                {t('hero.badge')}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-5 max-w-md text-4xl font-semibold leading-[1.02] tracking-tight text-white xl:text-5xl"
              >
                {t('hero.title1')} <span className="text-brand-400">{t('hero.title2')}</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-sm text-sm leading-relaxed text-white/65"
              >
                {t('hero.subtitle')}
              </motion.p>
            </div>

            <motion.ul variants={fadeUp} className="space-y-3 border-t border-white/15 pt-7">
              {POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-[13px] text-white/70">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-brand-400">
                    <Icon size={13} />
                  </span>
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </aside>

        {/* ---------- Form panel ---------- */}
        <div
          className={`relative flex flex-1 justify-center px-5 py-10 sm:px-8 ${wider ? 'items-start' : 'items-center'}`}
        >
          <Link
            to="/"
            className="group absolute left-5 top-6 inline-flex items-center gap-2 rounded-full border border-line bg-slate-900/[0.025] px-3.5 py-2 text-[13px] font-semibold text-slate-500 transition-colors hover:border-brand-600/40 hover:text-brand-700 sm:left-8"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            {t('nav.home')}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
            // A short login card can center vertically without a fight — the
            // back button sits well clear of it either way. This wide,
            // content-heavy form cannot: centering a tall box makes its own
            // top edge float up near the container's top edge, which is
            // exactly where the back button lives. `items-start` plus real
            // top padding gives it a fixed clearance instead.
            className={`w-full ${wider ? 'max-w-3xl' : wide ? 'max-w-xl' : 'max-w-sm'} pt-14 ${wider ? 'lg:pt-10' : 'lg:pt-0'}`}
          >
            <Link to="/" className="mb-9 flex justify-center lg:hidden">
              <img src="/brand/wordmark.png" alt="Book My Carer" className="h-12 w-auto" />
            </Link>
            {children}
          </motion.div>
        </div>
      </div>

      <MinimalFooter />
    </div>
  )
}
