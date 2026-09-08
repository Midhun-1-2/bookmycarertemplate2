import { Link, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, ClipboardList, IndianRupee, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { categoriesApi, servicePagesApi } from '../../lib/mockApi'
import { getCategoryIcon } from '../../lib/icons'
import { useSession } from '../../lib/session'
import Button from '../../components/ui/Button'
import Spotlight from '../../components/motion/Spotlight'
import Reveal, { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import TextReveal from '../../components/motion/TextReveal'

/** Feature / requirement list: an ember tick rule per item instead of a bullet,
 *  which reads as a checklist rather than prose on a dark ground. */
function PointList({ items }) {
  return (
    <ul className="mt-5 space-y-3.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-500">
          <span className="mt-2 h-px w-4 shrink-0 bg-brand-600" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function ServiceDetailPage() {
  const { t } = useTranslation()
  const { categorySlug, serviceId } = useParams()
  const { session } = useSession()
  const categories = categoriesApi.listSync()
  const category = categories.find((c) => c.slug === categorySlug)
  if (!category) return <Navigate to="/services" replace />

  const service = category.services.find((s) => s.id === serviceId)
  if (!service) return <Navigate to={`/services/${categorySlug}`} replace />

  const pages = servicePagesApi.listSync()
  const page = pages.find((p) => p.serviceId === serviceId && p.status === 'published')
  const Icon = getCategoryIcon(category.icon)

  const description =
    page?.description ??
    t('serviceDetail.defaultDescription', {
      serviceName: service.name,
      categoryName: category.name,
    })
  const features = page?.features ?? [
    t('serviceDetail.defaultFeature1'),
    t('serviceDetail.defaultFeature2'),
    t('serviceDetail.defaultFeature3'),
  ]
  const requirements = page?.requirements ?? [t('serviceDetail.defaultRequirement')]
  const pricing =
    page?.pricing ??
    (service.priceFrom != null
      ? [{ label: t('serviceDetail.hourly'), price: service.priceFrom, unit: t('common.perHourUnit') }]
      : [])

  const bookTo =
    session?.role === 'user' ? `/user/book/${category.slug}/${service.id}` : '/login/user'

  return (
    <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-16 sm:px-8 lg:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-16 h-[26rem] w-[26rem] animate-ember rounded-full bg-brand-600/10 blur-[110px]"
      />

      <Reveal variant="fade">
        <Link
          to={`/services/${categorySlug}`}
          className="group inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          {category.name}
        </Link>
      </Reveal>

      <div className="relative mt-7 flex items-start gap-5">
        <Reveal variant="scale" className="hidden shrink-0 sm:block">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-600/30 bg-brand-600/12 text-brand-700">
            <Icon size={24} />
          </span>
        </Reveal>
        <div className="min-w-0">
          <TextReveal
            text={service.name}
            as="h1"
            className="text-4xl font-semibold leading-[1.03] tracking-tight text-slate-900 sm:text-5xl"
          />
          <Reveal delay={0.15}>
            <p className="eyebrow mt-4 text-slate-400">
              {page?.shortDescription ?? category.name}
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.2}>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-500">{description}</p>
      </Reveal>

      <div className="rule-fade my-12" />

      <RevealGroup gap={0.1} className="grid gap-4 sm:grid-cols-2">
        <RevealItem>
          <Spotlight className="glass h-full rounded-2xl p-6">
            <h3 className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-700">
              <CheckCircle2 size={13} />
              {t('serviceDetail.featuresAndBenefits')}
            </h3>
            <PointList items={features} />
          </Spotlight>
        </RevealItem>
        <RevealItem>
          <Spotlight className="glass h-full rounded-2xl p-6">
            <h3 className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-700">
              <ClipboardList size={13} />
              {t('serviceDetail.requirements')}
            </h3>
            <PointList items={requirements} />
          </Spotlight>
        </RevealItem>
      </RevealGroup>

      <Reveal variant="scale" className="mt-4">
        <div className="relative overflow-hidden rounded-2xl border border-brand-600/25 bg-gradient-to-br from-brand-600/[0.09] via-surface to-surface p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 animate-ember rounded-full bg-brand-600/20 blur-[70px]"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-8">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-700">
                {t('serviceDetail.pricing')}
              </h3>
              <div className="mt-5 flex flex-wrap gap-8">
                {pricing.map((p) => (
                  <div key={p.label}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      {p.label}
                    </p>
                    <p className="mt-1.5 flex items-center font-display text-3xl font-semibold tracking-tight text-slate-900">
                      <IndianRupee size={20} />
                      {p.price}
                      <span className="ml-1 font-sans text-sm font-normal text-slate-400">
                        {p.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link to={bookTo}>
              <Button size="lg">
                {t('serviceDetail.bookThisService')}
                <ArrowUpRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
