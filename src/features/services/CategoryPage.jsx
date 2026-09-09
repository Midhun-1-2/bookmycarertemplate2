import { Link, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, ArrowRight, IndianRupee, ArrowLeft } from 'lucide-react'
import { categoriesApi, getServiceStartingPrice } from '../../lib/mockApi'
import { getCategoryEmoji } from '../../lib/icons'
import { useSession } from '../../lib/session'
import Button from '../../components/ui/Button'
import Reveal, { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import TextReveal from '../../components/motion/TextReveal'
import { cn } from '../../lib/cn'

/** Cycled per service card so a category's grid reads as varied rather than
 *  one flat colour — the left accent and the icon badge share a tone, five
 *  wide so neighbours in a 3-column row rarely repeat. */
const CARD_ACCENTS = [
  { border: 'border-l-rose-300', badge: 'bg-rose-50 text-rose-500' },
  { border: 'border-l-emerald-300', badge: 'bg-emerald-50 text-emerald-600' },
  { border: 'border-l-amber-300', badge: 'bg-amber-50 text-amber-600' },
  { border: 'border-l-violet-300', badge: 'bg-violet-50 text-violet-600' },
  { border: 'border-l-sky-300', badge: 'bg-sky-50 text-sky-600' },
]

export default function CategoryPage() {
  const { t } = useTranslation()
  const { categorySlug } = useParams()
  const { session } = useSession()
  const categories = categoriesApi.listSync()
  const category = categories.find((c) => c.slug === categorySlug)

  if (!category) return <Navigate to="/services" replace />

  const emoji = getCategoryEmoji(category.icon)
  const words = category.name.split(' ')

  return (
    <div className="relative overflow-hidden">
      {/* Decorative watermark: the category's own emoji, huge and faint,
          scattered behind the content. Pet care gets paws, elder care gets a
          person — it comes free from data instead of a hand-picked motif per
          category, the way a hearts-and-paws background would need one. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        <span className="absolute -left-6 top-20 rotate-[-12deg] text-[9rem] opacity-[0.06] sm:text-[11rem]">
          {emoji}
        </span>
        <span className="absolute right-0 top-[26rem] rotate-[8deg] text-[7rem] opacity-[0.05] sm:text-[9rem]">
          {emoji}
        </span>
        <span className="absolute left-1/3 top-[52rem] rotate-[-6deg] text-[8rem] opacity-[0.05] sm:text-[10rem]">
          {emoji}
        </span>
        <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-brand-600/[0.07] blur-[100px]" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-accent-400/[0.08] blur-[100px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-5 pt-10 sm:px-8 sm:pt-14">
        <Reveal variant="fade">
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            {t('servicesListPage.title')}
          </Link>
        </Reveal>

        <Reveal variant="fade" delay={0.05}>
          <span className="eyebrow mt-6 inline-block text-brand-700">
            {String(category.services.length).padStart(2, '0')} {t('nav.servicesCount')}
          </span>
        </Reveal>

        <div className="mt-4 flex items-end gap-5">
          <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-3xl sm:flex">
            {emoji}
          </span>
          <TextReveal
            text={category.name}
            as="h1"
            animateOnMount
            delay={0.1}
            highlight={[words.length - 1]}
            className="text-4xl font-semibold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl"
          />
        </div>

        <Reveal delay={0.25}>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            {category.description}
          </p>
        </Reveal>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
        <RevealGroup gap={0.06} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {category.services.map((service, i) => {
            const price = service.priceFrom ?? getServiceStartingPrice(service.id)
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
            return (
              <RevealItem key={service.id}>
                <div
                  className={cn(
                    'glass flex h-full flex-col justify-between rounded-2xl border-l-4 p-5 transition-[transform,box-shadow] duration-400 hover:-translate-y-1',
                    accent.border
                  )}
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <span
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl',
                          accent.badge
                        )}
                      >
                        {emoji}
                      </span>
                      <h3 className="pt-1.5 text-lg font-semibold leading-snug tracking-tight text-slate-900">
                        {service.name}
                      </h3>
                    </div>

                    {price != null && (
                      <div className="mt-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                          {t('categoryPage.startingFrom')}
                        </p>
                        <p className="mt-0.5 flex items-baseline gap-1 font-display text-2xl font-bold text-brand-600">
                          <IndianRupee size={17} />
                          {price}
                          <span className="font-sans text-xs font-normal text-slate-400">
                            {t('common.perHour')}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
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
                    <Link
                      to={`/services/${category.slug}/${service.id}`}
                      className="group inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 transition-colors hover:text-brand-700"
                    >
                      {t('categoryPage.details')}
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </section>
    </div>
  )
}
