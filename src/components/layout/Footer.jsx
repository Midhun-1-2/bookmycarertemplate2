import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { categoriesApi } from '../../lib/mockApi'
import Reveal, { RevealGroup, RevealItem } from '../motion/Reveal'

function FooterLink({ to, children }) {
  const inner = (
    <span className="group inline-flex items-center gap-1 text-sm text-white/60 transition-colors duration-300 hover:text-white">
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand-500 transition-all duration-400 group-hover:w-full" />
      </span>
      <ArrowUpRight
        size={12}
        className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </span>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

/**
 * Public footer.
 *
 * This is where the client black does its heaviest work: one solid ink band
 * closing an otherwise ivory page, so both brand colours get a full field of
 * their own without the site ever becoming a dark theme.
 *
 * The link columns are driven off the live category list, so the footer can't
 * drift from the taxonomy.
 */
export default function Footer() {
  const { t } = useTranslation()
  const categories = categoriesApi.listSync()
  const half = Math.ceil(categories.length / 2)
  const columns = [categories.slice(0, half), categories.slice(half)]

  return (
    <footer className="ink-panel relative mt-auto overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/2 h-96 w-[52rem] -translate-x-1/2 animate-ember rounded-full bg-brand-600/25 blur-[110px]"
      />

      {/* Extra bottom clearance on mobile only: the chat launcher is a fixed
          `bottom-5` circle that isn't part of document flow, so nothing here
          naturally makes room for it — without this the last line sits
          directly under the button. */}
      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pb-10">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <Reveal>
            {/* The supplied wordmark is black lettering; on the ink band it is
                knocked out to solid white rather than swapped for another asset. */}
            <img
              src="/brand/wordmark.png"
              alt="Book My Carer"
              className="h-14 w-auto brightness-0 invert"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {t('footer.tagline')}
            </p>
            <Link to="/become-a-caregiver" className="mt-6 inline-block">
              <span className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-300 hover:border-brand-500 hover:bg-brand-600">
                {t('nav.becomeACaregiver')}
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          </Reveal>

          <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-10">
            {columns.map((column, i) => (
              <RevealItem key={i}>
                <p className="eyebrow mb-4 text-brand-400">
                  {i === 0 ? t('footer.careType') : t('footer.services')}
                </p>
                <ul className="space-y-2.5">
                  {column.map((cat) => (
                    <li key={cat.id}>
                      <FooterLink to={`/services/${cat.slug}`}>{cat.name}</FooterLink>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
            <RevealItem className="col-span-2 sm:col-span-1">
              <p className="eyebrow mb-4 text-brand-400">{t('footer.company')}</p>
              <ul className="space-y-2.5">
                <li>
                  <FooterLink>{t('footer.aboutUs')}</FooterLink>
                </li>
                <li>
                  <FooterLink>{t('footer.careers')}</FooterLink>
                </li>
                <li>
                  <FooterLink>{t('footer.contact')}</FooterLink>
                </li>
              </ul>
            </RevealItem>
          </RevealGroup>
        </div>

        <div className="mt-14 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-2 pt-6 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
            {t('footer.poweredBy')}
          </p>
        </div>
      </div>
    </footer>
  )
}
