import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDown,
  Search,
  UserCheck,
  HeartHandshake,
} from 'lucide-react'
import { categoriesApi } from '../../lib/mockApi'
import { getCategoryPhotoUrl, HERO_PHOTO_URL } from '../../lib/categoryImages'
import Carousel from '../../components/Carousel/Carousel'
import CategoryCard from '../../components/CategoryCard'
import Button from '../../components/ui/Button'
import Reveal, { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import TextReveal from '../../components/motion/TextReveal'
import CountUp from '../../components/motion/CountUp'
import Magnetic from '../../components/motion/Magnetic'
import { EASE_OUT_EXPO, stagger, fadeUp } from '../../lib/motion'

/** Section label: mono eyebrow with an ember rule running out of it.
 *  `onInk` switches it to the tint used on the black panels. */
function SectionEyebrow({ children, className = '', onInk = false }) {
  return (
    <span
      className={`eyebrow flex items-center gap-3 ${onInk ? 'text-brand-400' : 'text-brand-700'} ${className}`}
    >
      <span
        className={`h-px w-10 bg-gradient-to-r to-transparent ${onInk ? 'from-brand-400' : 'from-brand-600'}`}
      />
      {children}
    </span>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const categories = categoriesApi.listSync()

  const heroRef = useRef(null)
  const processRef = useRef(null)

  // Hero parallax: the portrait drifts up and dims as the page scrolls past,
  // so the fold hands over to the next section instead of just leaving.
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroImageY = useTransform(heroProgress, [0, 1], ['0%', '18%'])
  const heroCopyY = useTransform(heroProgress, [0, 1], ['0%', '-14%'])
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, 0])

  // The process rail draws itself as the section scrolls through the viewport.
  const { scrollYProgress: processProgress } = useScroll({
    target: processRef,
    offset: ['start 75%', 'end 60%'],
  })
  const railScale = useSpring(processProgress, { stiffness: 120, damping: 28 })

  const TRUST_POINTS = [
    { icon: ShieldCheck, label: t('trust.verified') },
    { icon: Clock, label: t('trust.flexible') },
    { icon: Star, label: t('trust.rated') },
  ]

  const STATS = [
    { value: 12400, suffix: '+', label: t('stats.families') },
    { value: 860, suffix: '+', label: t('stats.caregivers') },
    { value: 24, suffix: '', label: t('stats.cities') },
    { value: 4.8, decimals: 1, suffix: '/5', label: t('stats.rating') },
  ]

  const STEPS = [
    { icon: Search, title: t('process.step1Title'), body: t('process.step1Body') },
    { icon: UserCheck, title: t('process.step2Title'), body: t('process.step2Body') },
    { icon: HeartHandshake, title: t('process.step3Title'), body: t('process.step3Body') },
  ]

  const slides = categories.slice(0, 3).map((cat) => ({
    id: cat.id,
    title: cat.name,
    description: cat.description,
    ctaLabel: t('carousel.exploreServices'),
    ctaTo: `/services/${cat.slug}`,
    image: getCategoryPhotoUrl(cat.icon, { w: 1400, q: 80 }),
  }))

  return (
    <div>
      {/* ================= HERO ================= */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Ambient ember pools, drifting slowly so the black never sits still. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-0 h-[36rem] w-[36rem] animate-drift rounded-full bg-brand-600/8 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-40 h-[28rem] w-[28rem] animate-ember rounded-full bg-brand-600/6 blur-[120px]"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-24">
          <motion.div style={{ y: heroCopyY, opacity: heroFade }}>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className="inline-flex items-center gap-2.5 rounded-full border border-brand-600/30 bg-brand-600/10 py-1.5 pl-2 pr-4"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute h-2 w-2 animate-pulse-ring rounded-full bg-brand-500" />
                <span className="h-2 w-2 rounded-full bg-brand-600" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">
                {t('hero.badge')}
              </span>
            </motion.span>

            <h1 className="mt-7 text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.035em] text-slate-900 sm:text-6xl lg:text-[4.4rem]">
              <TextReveal as="span" text={t('hero.title1')} animateOnMount delay={0.15} />
              <br />
              <TextReveal
                as="span"
                text={t('hero.title2')}
                animateOnMount
                delay={0.32}
                highlight={[0, 1, 2, 3, 4, 5]}
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE_OUT_EXPO }}
              className="mt-7 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              variants={stagger(0.08, 0.7)}
              initial="hidden"
              animate="show"
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <motion.div variants={fadeUp}>
                <Magnetic strength={7}>
                  <Link to="/login/user">
                    <Button size="lg" magnetic={false}>
                      {t('hero.cta1')}
                      <ArrowUpRight size={18} />
                    </Button>
                  </Link>
                </Magnetic>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link to="/services">
                  <Button size="lg" variant="secondary">
                    {t('hero.cta2')}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.ul
              variants={stagger(0.08, 0.9)}
              initial="hidden"
              animate="show"
              className="mt-10 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:flex-wrap sm:gap-x-8"
            >
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <motion.li
                  key={label}
                  variants={fadeUp}
                  className="flex items-center gap-2.5 text-[13px] font-medium text-slate-500"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-600/25 bg-brand-600/10 text-brand-700">
                    <Icon size={14} />
                  </span>
                  {label}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Portrait: an off-centre frame with the image bleeding past a hairline
              rule, plus two floating glass chips that arrive after it settles. */}
          <motion.div
            style={{ y: heroImageY }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE_OUT_EXPO }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="absolute -inset-3 -z-10 rounded-[2.5rem] border border-line" />
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src={HERO_PHOTO_URL}
                alt={t('home.heroImageAlt')}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/25 via-transparent to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 1.05, ease: EASE_OUT_EXPO }}
              className="glass absolute -right-3 top-10 flex items-center gap-3 rounded-2xl px-4 py-3 sm:-right-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
                <Star size={17} fill="currentColor" strokeWidth={0} />
              </span>
              <div>
                <p className="font-mono text-lg font-semibold leading-none text-slate-900">4.8</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  {t('home.chipRatingSub')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: heroFade }}
          className="mx-auto hidden max-w-7xl items-center gap-2 px-8 pb-10 lg:flex"
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-slate-400"
          >
            <ArrowDown size={14} />
          </motion.span>
          <span className="eyebrow text-slate-400">{t('home.scrollCue')}</span>
        </motion.div>
      </section>

      {/* ================= STATS ================= */}
      {/* The hero used to hand over to a ticker strip; with that gone this rule
          is what keeps the fold from bleeding straight into the figures. */}
      <section className="mx-auto max-w-7xl border-t border-line px-5 py-16 sm:px-8 lg:py-24">
        <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <RevealItem key={s.label} className="relative">
              {i > 0 && (
                <span
                  aria-hidden
                  className="absolute -left-3 top-1 hidden h-14 w-px bg-line lg:block"
                />
              )}
              <p className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                <CountUp
                  value={s.value}
                  decimals={s.decimals ?? 0}
                  suffix={s.suffix}
                  duration={1.8}
                />
              </p>
              <p className="mt-2.5 max-w-[14rem] text-[13px] leading-snug text-slate-500">
                {s.label}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ================= FEATURED CAROUSEL ================= */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
        <Reveal>
          <Carousel slides={slides} />
        </Reveal>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal variant="fade">
              <SectionEyebrow>{t('home.categoriesEyebrow')}</SectionEyebrow>
            </Reveal>
            <TextReveal
              text={t('browse.title')}
              className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
              highlight={[2, 3]}
            />
            <Reveal delay={0.15}>
              <p className="mt-3 max-w-md text-sm text-slate-500 sm:text-base">
                {t('browse.subtitle')}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link to="/services">
              <Button variant="outline" size="md">
                {t('browse.viewAll')}
                <ArrowUpRight size={15} />
              </Button>
            </Link>
          </Reveal>
        </div>

        <RevealGroup gap={0.06} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <RevealItem key={cat.id}>
              <CategoryCard category={cat} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ================= PROCESS ================= */}
      <section ref={processRef} className="relative border-t border-line py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 max-w-2xl">
            <Reveal variant="fade">
              <SectionEyebrow>{t('process.eyebrow')}</SectionEyebrow>
            </Reveal>
            <TextReveal
              text={t('process.title')}
              className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
              highlight={[3, 4]}
            />
          </div>

          <div className="relative">
            {/* Rail that draws itself as this section scrolls past. */}
            <span
              aria-hidden
              className="absolute left-[1.4rem] top-2 hidden h-[calc(100%-3rem)] w-px bg-line lg:left-0 lg:top-[1.4rem] lg:h-px lg:w-full"
            />
            <motion.span
              aria-hidden
              style={{ scaleY: railScale, scaleX: railScale }}
              className="absolute left-[1.4rem] top-2 hidden h-[calc(100%-3rem)] w-px origin-top bg-gradient-to-b from-brand-600 to-brand-600/0 lg:left-0 lg:top-[1.4rem] lg:h-px lg:w-full lg:origin-left lg:bg-gradient-to-r"
            />

            <RevealGroup gap={0.12} className="grid gap-10 lg:grid-cols-3 lg:gap-8">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <RevealItem key={title} className="relative pl-16 lg:pl-0 lg:pt-16">
                  <span className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-600/35 bg-void text-brand-700">
                    <Icon size={18} />
                  </span>
                  <p className="font-mono text-[11px] tracking-[0.2em] text-slate-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2.5 text-xl font-semibold tracking-tight text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-slate-500">{body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ================= CLOSING CTA ================= */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-28">
        <Reveal variant="scale">
          <div className="ink-panel relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-14 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-96 w-[42rem] -translate-x-1/2 -translate-y-1/2 animate-ember rounded-full bg-brand-600/40 blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]"
            />

            <div className="relative">
              <SectionEyebrow onInk className="justify-center">{t('home.ctaEyebrow')}</SectionEyebrow>
              <TextReveal
                text={t('home.ctaTitle')}
                className="mx-auto mt-6 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl"
                wordClassName=""
                highlight={[]}
              />
              <Reveal delay={0.15}>
                <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  {t('home.ctaSubtitle')}
                </p>
              </Reveal>
              <Reveal delay={0.25} className="mt-9 flex flex-wrap justify-center gap-3">
                <Magnetic strength={9}>
                  <Link to="/login/user">
                    <Button size="lg" magnetic={false}>
                      {t('home.ctaButton')}
                      <ArrowUpRight size={18} />
                    </Button>
                  </Link>
                </Magnetic>
                <Link to="/become-a-caregiver">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
                  >
                    {t('nav.becomeACaregiver')}
                  </Button>
                </Link>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
