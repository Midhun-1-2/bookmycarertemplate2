import {
  Stethoscope,
  Activity,
  HeartHandshake,
  HandHeart,
  Baby,
  Brain,
  Leaf,
  PawPrint,
} from 'lucide-react'

export const CATEGORY_ICONS = {
  Stethoscope,
  Activity,
  HeartHandshake,
  HandHeart,
  Baby,
  Brain,
  Leaf,
  PawPrint,
}

export function getCategoryIcon(name) {
  return CATEGORY_ICONS[name] ?? HeartHandshake
}

/** Emoji shown on the category's icon badge — friendlier and faster to scan
 *  as a set of eight than a monochrome glyph would be. */
export const CATEGORY_EMOJI = {
  Stethoscope: '🩺',
  Activity: '🦵',
  HeartHandshake: '🧓',
  HandHeart: '🤝',
  Baby: '🍼',
  Brain: '🧠',
  Leaf: '🧘',
  PawPrint: '🐾',
}

export function getCategoryEmoji(name) {
  return CATEGORY_EMOJI[name] ?? '💛'
}

/** Pastel badge tint per category, so the grid reads as varied at a glance
 *  rather than eight identical brand-red squares. */
export const CATEGORY_TINT = {
  Stethoscope: 'bg-teal-100 text-teal-700',
  Activity: 'bg-amber-100 text-amber-700',
  HeartHandshake: 'bg-violet-100 text-violet-700',
  HandHeart: 'bg-accent-100 text-accent-700',
  Baby: 'bg-pink-100 text-pink-700',
  Brain: 'bg-indigo-100 text-indigo-700',
  Leaf: 'bg-emerald-100 text-emerald-700',
  PawPrint: 'bg-orange-100 text-orange-700',
}

export function getCategoryTint(name) {
  return CATEGORY_TINT[name] ?? 'bg-slate-100 text-slate-700'
}
