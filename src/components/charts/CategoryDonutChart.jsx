import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import { CATEGORICAL as COLORS } from './chartColors'

function CustomTooltip({ active, payload, t }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3.5 py-2.5 text-xs">
      <p className="font-medium text-slate-700">{payload[0].name}</p>
      <p className="text-brand-700">{t('charts.bookingsCount', { count: payload[0].value })}</p>
    </div>
  )
}

export default function CategoryDonutChart({ data }) {
  const { t } = useTranslation()
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-slate-400">{t('charts.noData')}</p>
  }
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={82}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip t={t} />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {data.map((entry, i) => (
          <li key={entry.name} className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="truncate">{entry.name}</span>
            <span className="ml-auto shrink-0 font-medium text-slate-500">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
