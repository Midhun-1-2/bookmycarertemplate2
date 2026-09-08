import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslation } from 'react-i18next'
import { AXIS, BRAND, STATUS_COLORS } from './chartColors'

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3.5 py-2.5 text-xs">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="text-brand-700">{t('charts.bookingsCount', { count: payload[0].value })}</p>
    </div>
  )
}

export default function StatusBarChart({ data }) {
  const { t } = useTranslation()
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={AXIS.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: AXIS.tick }} axisLine={{ stroke: AXIS.line }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: AXIS.tick }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: AXIS.cursor }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? BRAND} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
