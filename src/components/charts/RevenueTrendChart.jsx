import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { AXIS, BRAND, BRAND_SOFT } from './chartColors'

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3.5 py-2.5 text-xs">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="font-semibold text-slate-900">
        {t('charts.revenueLabel', { value: payload[0].value })}
      </p>
    </div>
  )
}

/**
 * Revenue area. On black the line has to carry the chart, so it runs as a
 * two-stop gradient stroke with a soft glow beneath it and the fill fades to
 * nothing well before the axis — a solid fill would just read as a dark block.
 */
export default function RevenueTrendChart({ data }) {
  const { t } = useTranslation()
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.42} />
            <stop offset="70%" stopColor={BRAND} stopOpacity={0.06} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BRAND} />
            <stop offset="100%" stopColor={BRAND_SOFT} />
          </linearGradient>
          <filter id="revenueGlow" x="-20%" y="-40%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="2 6" stroke={AXIS.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: AXIS.tick }}
          axisLine={{ stroke: AXIS.line }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: AXIS.tick }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip t={t} />} cursor={{ stroke: AXIS.line }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="url(#revenueStroke)"
          strokeWidth={2.5}
          fill="url(#revenueFill)"
          filter="url(#revenueGlow)"
          activeDot={{ r: 4, fill: BRAND, stroke: '#ffffff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
