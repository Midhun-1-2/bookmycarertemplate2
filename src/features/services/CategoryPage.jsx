import { Link, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowUpRight, IndianRupee, ArrowLeft } from 'lucide-react'
import { categoriesApi, getServiceStartingPrice } from '../../lib/mockApi'
import { getCategoryIcon } from '../../lib/icons'
import { getCategoryPhotoUrl } from '../../lib/categoryImages'
import { useSession } from '../../lib/session'
import Button from '../../components/ui/Button'
import Spotlight from '../../components/motion/Spotlight'
import Reveal, { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import TextReveal from '../../components/motion/TextReveal'
import { EASE_OUT_EXPO } from '../../lib/motion'

export default function CategoryPage() {
  const { t } = useTranslation()
  const { categorySlug } = useParams()
  const { session } = useSession()
  const categories = categoriesApi.listSync()
  const category = categories.find((c) => c.slug === categorySlug)
  const bannerRef = useRef(null)

  // Hooks must run unconditionally, so this is set up before the early return.
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start start', 'end start'],
  })
  const bannerY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])

  if (!category) return <Navigate to="/services" replace />

  const Icon = getCategoryIcon(category.icon)

  return (
    <div>
      {/* Full-bleed banner: the photo parallaxes behind a heavy gradient so the
          title sits on near-black no matter how bright the image is. */}
      <section ref={bannerRef} className="relative h-[22rem] overflow-hidden bg-ink sm:h-[28rem]">
        <motion.img
          src={getCategoryPhotoUrl(category.icon, { w: 1600, q: 80 })}
          alt={category.name}
          style={{ y: bannerY }}
          className="absolute inset-0 h-[130%] w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-transparent to-transparent" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-12 sm:px-8">
          <Reveal variant="fade">
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-[13px] font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft
                size={14}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              {t('servicesListPage.title')}
            </Link>
          </Reveal>

          <div className="mt-6 flex items-end gap-5">
            <motion.span
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
              className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white backdrop-blur-md sm:flex"
            >
              <Icon size={26} />
            </motion.span>
            <div className="min-w-0">
              <TextReveal
                text={category.name}
                as="h1"
                animateOnMount
                delay={0.15}
                className="text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl"
              />
            </div>
          </div>

          <Reveal delay={0.3}>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              {category.description}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8">
        <div className="mb-8 flex items-center gap-4">
          <span className="eyebrow shrink-0 text-brand-700">
            {String(category.services.length).padStart(2, '0')} {t('nav.servicesCount')}
          </span>
          <span className="rule-fade flex-1" />
        </div>

        <RevealGroup gap={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.services.map((service) => {
            const price = service.priceFrom ?? getServiceStartingPrice(service.id)
            return (
              <RevealItem key={service.id}>
                <Spotlight className="glass flex h-full flex-col justify-between rounded-2xl p-5 transition-[border-color,transform] duration-400 hover:-translate-y-1 hover:border-brand-600/40">
                  <div>
                    <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-900">
                      {service.name}
                    </h3>
                    {price != null && (
                      <p className="mt-3 flex items-baseline gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                          {t('categoryPage.startingFrom')}
                        </span>
                        <span className="inline-flex items-center font-display text-2xl font-semibold text-brand-700">
                          <IndianRupee size={15} />
                          {price}
                          <span className="ml-0.5 font-sans text-xs font-normal text-slate-400">
                            {t('common.perHour')}
                          </span>
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      to={
                        session?.role === 'user'
                          ? `/user/book/${category.slug}/${service.id}`
                          : '/login/user'
                      }
                    >
                      <Button variant="primary" size="sm">
                        {t('categoryPage.bookNow')}
                        <ArrowUpRight size={14} />
                      </Button>
                    </Link>
                    <Link to={`/services/${category.slug}/${service.id}`}>
                      <Button variant="ghost" size="sm">
                        {t('categoryPage.details')}
                      </Button>
                    </Link>
                  </div>
                </Spotlight>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </section>
    </div>
  )
}
