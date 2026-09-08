// Chart colours, kept in sync by hand with the @theme scales in src/index.css
// (Recharts needs literal colours, it can't read Tailwind classes).
//
// Tuned for the ivory canvas: gridlines are barely-there warm hairlines rather
// than grey rules, and every series colour is dark enough to hold its own
// against white without turning the chart into a poster.

export const AXIS = {
  grid: '#eae4dc', // between line and line-strong
  line: '#e7e1d9', // line
  tick: '#9b9391', // slate-400
  tickStrong: '#574f50', // slate-600
  cursor: 'rgba(35,31,32,0.045)',
}

export const BRAND = '#dd222b' // brand-600
export const BRAND_SOFT = '#e86d73' // brand-400

// Categorical series: the brand red leads, then the client black, then three
// clearly separated hues. Ordered so the first two — the ones most charts
// actually use — are the client's own colours.
export const CATEGORICAL = ['#dd222b', '#231f20', '#c08715', '#3a72c9', '#2b8f61', '#9b9391']

export const STATUS_COLORS = {
  pending: '#c08715', // amber — waiting on someone
  confirmed: '#3a72c9', // the one cool note: booked, not yet started
  'in-progress': '#dd222b', // brand red — happening now
  completed: '#2b8f61', // green — done
  cancelled: '#b8b0aa', // deliberately desaturated: a non-event
  unattended: '#e06a1f', // orange — needs attention, distinct from cancelled
}
