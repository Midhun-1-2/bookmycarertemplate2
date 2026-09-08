import { useEffect, useRef, useState } from 'react'

const EASE_OUT_EXPO = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

/**
 * Number that counts up the first time it scrolls into view.
 *
 * Deliberately plain — an IntersectionObserver to arm it, a rAF loop to run it.
 * The displayed text has to be re-formatted from the raw value every frame
 * anyway (locale separators, fixed decimals), so routing this through the
 * animation library bought nothing and made the timing harder to reason about.
 *
 * The safety timer matters more than it looks: `requestAnimationFrame` does not
 * tick in a hidden or occluded tab, so without it a figure that scrolls into
 * view while the page is backgrounded would be stuck reading zero when the user
 * comes back. The count is decoration; the number is not.
 */
export default function CountUp({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
  locale = 'en-IN',
  className,
}) {
  const ref = useRef(null)
  const target = Number(value) || 0

  // Read once at mount: someone who has asked for reduced motion gets the final
  // figure immediately, with no count and no intermediate render.
  const [reduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  )
  const [display, setDisplay] = useState(() => (reduced ? target : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    let frame = 0
    let settle = 0
    let start = 0
    let armed = false

    function tick(now) {
      if (!start) start = now
      const progress = Math.min((now - start) / (duration * 1000), 1)
      setDisplay(target * EASE_OUT_EXPO(progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    function run() {
      if (armed) return
      armed = true
      observer.disconnect()
      frame = requestAnimationFrame(tick)
      settle = setTimeout(() => setDisplay(target), duration * 1000 + 400)
    }

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && run(),
      { threshold: 0.35 }
    )
    observer.observe(el)

    // IntersectionObserver callbacks are delivered by the rendering pipeline,
    // which a hidden or occluded tab skips entirely — so a figure already on
    // screen at mount would never arm. Rect maths needs no such pipeline.
    const box = el.getBoundingClientRect()
    if (box.top < window.innerHeight && box.bottom > 0) run()

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      clearTimeout(settle)
    }
  }, [target, duration, reduced])

  const formatted = display.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
