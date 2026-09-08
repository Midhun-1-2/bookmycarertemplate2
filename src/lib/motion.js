/**
 * The motion vocabulary for the whole template.
 *
 * Everything animated in the app pulls its easing, timing and variants from
 * here, so the interface moves as one object rather than as fifty components
 * each guessing at a duration. Two rules run through all of it:
 *
 *  1. Entrances travel a short distance and decelerate hard (`EASE_OUT_EXPO`).
 *     Nothing slides more than ~28px; motion signals arrival, not travel.
 *  2. Anything the pointer drives is a spring, never a duration, so it can be
 *     interrupted mid-flight and still feel physical.
 */

// Matches --ease-out-expo / --ease-in-out-quint in index.css.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]
export const EASE_IN_OUT_QUINT = [0.83, 0, 0.17, 1]

export const SPRING_SOFT = { type: 'spring', stiffness: 180, damping: 24, mass: 0.9 }
export const SPRING_SNAPPY = { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }
export const SPRING_GLIDE = { type: 'spring', stiffness: 90, damping: 20, mass: 1 }

/** Standard "rise into place" entrance. */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
}

/** Horizontal entrance; pass a custom of -1 / 1 for direction. */
export const slideIn = {
  hidden: (dir = 1) => ({ opacity: 0, x: dir * 28 }),
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
}

/** Parent for any list/grid that should cascade rather than pop in at once. */
export function stagger(childDelay = 0.07, initialDelay = 0) {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: childDelay, delayChildren: initialDelay },
    },
  }
}

/** Word-by-word headline reveal — the child of a `stagger()` parent. */
export const wordReveal = {
  hidden: { opacity: 0, y: '0.55em', rotateX: -55 },
  show: {
    opacity: 1,
    y: '0em',
    rotateX: 0,
    transition: { duration: 0.85, ease: EASE_OUT_EXPO },
  },
}

/** Shared viewport config so every scroll-triggered reveal fires at the same
 *  point on screen and never re-fires when the user scrolls back up. */
export const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -60px 0px' }
export const VIEWPORT_EARLY = { once: true, amount: 0.05, margin: '0px 0px -20px 0px' }

/** Route-level transition used by the page-transition wrapper. */
export const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } },
}

/** Modal / drawer / dropdown pairs. */
export const popIn = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: SPRING_SNAPPY },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.16 } },
}

export const dropdown = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } },
}

export const collapse = {
  hidden: { height: 0, opacity: 0 },
  show: { height: 'auto', opacity: 1, transition: { duration: 0.32, ease: EASE_OUT_EXPO } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}
