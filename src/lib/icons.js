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
