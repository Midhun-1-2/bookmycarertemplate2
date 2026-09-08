const CATEGORY_PHOTO_IDS = {
  Stethoscope: 'photo-1691139601099-932c01ec198b', // Nursing & Clinical — nurse checking a senior's vitals
  Activity: 'photo-1522898467493-49726bf28798', // Physio, Rehab & Speech — therapist guiding recovery work
  HeartHandshake: 'photo-1543333995-a78aea2eee50', // Elder & Disability Care — caregiver assisting a senior
  HandHeart: 'photo-1587556930720-58ec521056a5', // Personal & Daily Living — help with everyday living
  Baby: 'photo-1552819289-e14fbbcea868', // Mother & Baby Care — newborn with mother
  Brain: 'photo-1573497491208-6b1acb260507', // Mental Health & Counselling — counselling session
  Leaf: 'photo-1552758408-08129258d006', // Wellness & Lifestyle — yoga and mindfulness
  PawPrint: 'photo-1548199973-03cce0bbc87b', // Pet Care — dog walking
}

export const HERO_PHOTO_URL =
  'https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=900&q=80&auto=format&fit=crop'

export function getCategoryPhotoUrl(iconName, { w = 600, q = 75 } = {}) {
  const id = CATEGORY_PHOTO_IDS[iconName] ?? CATEGORY_PHOTO_IDS.HeartHandshake
  return `https://images.unsplash.com/${id}?w=${w}&q=${q}&auto=format&fit=crop`
}
