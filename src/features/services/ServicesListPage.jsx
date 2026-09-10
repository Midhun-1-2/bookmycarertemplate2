import { useTranslation } from 'react-i18next'
import { categoriesApi } from '../../lib/mockApi'
import CategoryCard from '../../components/CategoryCard'
import Reveal, { RevealGroup, RevealItem } from '../../components/motion/Reveal'
import TextReveal from '../../components/motion/TextReveal'

export default function ServicesListPage() {
  const { t } = useTranslation()
  const categories = categoriesApi.listSync()

  return (
    <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 lg:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-20 h-[28rem] w-[28rem] animate-drift rounded-full bg-brand-600/10 blur-[110px]"
      />

      <div className="relative max-w-2xl">
        <Reveal variant="fade" animateOnMount>
          <span className="eyebrow flex items-center gap-3 text-brand-700">
            <span className="h-px w-10 bg-gradient-to-r from-brand-600 to-transparent" />
            {t('home.categoriesEyebrow')}
          </span>
        </Reveal>
        <TextReveal
          text={t('servicesListPage.title')}
          as="h1"
          animateOnMount
          className="mt-5 text-4xl font-semibold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl"
          highlight={[1, 2]}
        />
        <Reveal delay={0.15} animateOnMount>
          <p className="mt-5 text-base leading-relaxed text-slate-500">
            {t('servicesListPage.subtitle')}
          </p>
        </Reveal>
      </div>

      <div className="rule-fade my-12" />

      <RevealGroup gap={0.06} animateOnMount className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <RevealItem key={cat.id}>
            <CategoryCard category={cat} showServices />
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  )
}
