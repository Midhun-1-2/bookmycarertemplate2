/**
 * Loading state for the console dashboards.
 *
 * The mock API answers after a deliberate delay, and returning `null` in the
 * meantime made the whole page snap into existence. Blocking out the layout in
 * advance means the content lands into a frame the eye has already parsed; the
 * `sheen` sweep is what marks it as pending rather than broken.
 */
function Block({ className = '' }) {
  return (
    <div className={`sheen overflow-hidden rounded-2xl border border-line bg-slate-900/[0.025] ${className}`} />
  )
}

export default function DashboardSkeleton({ tiles = 4, charts = 2 }) {
  return (
    <div className="animate-[fade-in_0.3s_ease-out]" aria-busy="true" aria-live="polite">
      <div className="mb-7">
        <Block className="h-3 w-24" />
        <Block className="mt-4 h-8 w-64" />
        <Block className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: tiles }).map((_, i) => (
          <Block key={i} className="h-36" />
        ))}
      </div>

      {charts > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Block className="h-72 lg:col-span-2" />
          <Block className="h-72" />
        </div>
      )}
      {charts > 2 && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Block className="h-64" />
          <Block className="h-64" />
        </div>
      )}
    </div>
  )
}
