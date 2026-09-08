import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import { AXIS, BRAND } from './chartColors'

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3.5 py-2.5 text-xs">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="text-brand-700">{t('charts.engagementsCount', { count: payload[0].value })}</p>
    </div>
  )
}

export default function StaffBarChart({ data }) {
  const { t } = useTranslation()
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={AXIS.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: AXIS.tick }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: AXIS.tickStrong }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: AXIS.cursor }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={BRAND} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
