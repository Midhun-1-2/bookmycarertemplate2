import { motion } from 'framer-motion'
import { stagger, wordReveal, VIEWPORT } from '../../lib/motion'
import { cn } from '../../lib/cn'

/**
 * Headline that assembles itself word by word, each word hinging up from below
 * its own baseline in 3D. The per-word `overflow-hidden` mask is what makes it
 * read as type being set rather than text sliding around.
 *
 * `highlight` marks words (by index) that get the ember gradient — one accented
 * phrase per headline is the house rule.
 */
export default function TextReveal({
  text,
  as = 'h2',
  className,
  wordClassName,
  highlight = [],
  delay = 0,
  gap = 0.055,
  once = true,
  animateOnMount = false,
}) {
  const Comp = motion[as] ?? motion.h2
  const words = String(text).split(' ')
  const marks = new Set(highlight)

  const trigger = animateOnMount
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: { ...VIEWPORT, once } }

  return (
    <Comp
      className={cn('inline-block', className)}
      variants={stagger(gap, delay)}
      initial="hidden"
      style={{ perspective: 800 }}
      {...trigger}
    >
      {words.map((word, i) => (
        // The mask is `overflow-hidden`, and display headings run at
        // `line-height: 1` — so the mask's box is exactly 1em while the glyph
        // ink is not. Both ends overflowed it: Fraunces' descenders (p, g, y)
        // below, and the Devanagari/Malayalam matras above. Both were being
        // sliced off.
        //
        // The padding gives the clip box room for that ink; the matching
        // negative margins take the space straight back out of the line box, so
        // heading leading is unchanged. Do not remove one without the other.
        //
        // Room above the line is free — words animate in from *below*, so no
        // hidden word is ever parked up there to leak through.
        <span
          key={`${word}-${i}`}
          className="-my-[0.32em] inline-block overflow-hidden py-[0.32em] align-bottom"
        >
          <motion.span
            variants={wordReveal}
            className={cn(
              'inline-block whitespace-pre',
              marks.has(i) && 'text-ember',
              wordClassName
            )}
            style={{ transformOrigin: 'bottom center' }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Comp>
  )
}
