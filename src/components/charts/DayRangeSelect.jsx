import { useTranslation } from 'react-i18next'

const OPTIONS = [7, 14, 30, 90]

export default function DayRangeSelect({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-8 shrink-0 cursor-pointer rounded-lg border border-line bg-slate-900/[0.03] px-2.5 font-mono text-[11px] font-medium text-slate-600 outline-none transition-colors hover:border-line-strong focus:border-brand-600/60 [&>option]:bg-surface-2 [&>option]:text-slate-800"
    >
      {OPTIONS.map((d) => (
        <option key={d} value={d}>
          {t('charts.lastNDays', { days: d })}
        </option>
      ))}
    </select>
  )
}
