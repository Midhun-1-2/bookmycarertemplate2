import { readStore, writeStore } from './storage'
import categoriesSeed from '../mock-data/categories.json'
import staffSeed from '../mock-data/staff.json'
import usersSeed from '../mock-data/users.json'
import adminsSeed from '../mock-data/admins.json'
import bookingsSeed from '../mock-data/bookings.json'
import notificationsSeed from '../mock-data/notifications.json'
import servicePagesSeed from '../mock-data/servicePages.json'

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

function makeCollection(key, seed) {
  return {
    async list() {
      await delay()
      return readStore(key, seed)
    },
    listSync() {
      return readStore(key, seed)
    },
    async get(id) {
      await delay()
      return readStore(key, seed).find((item) => item.id === id) ?? null
    },
    async create(data) {
      await delay()
      const items = readStore(key, seed)
      items.push(data)
      writeStore(key, items)
      return data
    },
    async update(id, patch) {
      await delay()
      const items = readStore(key, seed)
      const idx = items.findIndex((item) => item.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...patch }
      writeStore(key, items)
      return items[idx]
    },
    async remove(id) {
      await delay()
      const items = readStore(key, seed).filter((item) => item.id !== id)
      writeStore(key, items)
    },
  }
}

export const categoriesApi = makeCollection('categories', categoriesSeed)
export const staffApi = makeCollection('staff', staffSeed)
export const usersApi = makeCollection('users', usersSeed)
export const adminsApi = makeCollection('admins', adminsSeed)
export const bookingsApi = makeCollection('bookings', bookingsSeed)
export const notificationsApi = makeCollection('notifications', notificationsSeed)
export const servicePagesApi = makeCollection('servicePages', servicePagesSeed)
export const chatMessagesApi = makeCollection('chatMessages', [])

export function getServiceStartingPrice(serviceId) {
  const page = servicePagesApi.listSync().find((p) => p.serviceId === serviceId)
  return page?.pricing?.[0]?.price ?? null
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function pushNotification({ userId, title, message, channel = 'whatsapp' }) {
  return notificationsApi.create({
    id: genId('notif'),
    userId,
    channel,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  })
}

export async function getNotificationsForUser(userId) {
  const items = await notificationsApi.list()
  return items
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createBooking(data) {
  const booking = {
    id: genId('booking'),
    status: 'pending',
    checkInOtp: null,
    checkIn: null,
    checkOut: null,
    payment: { status: 'pending', amount: data.amount ?? 0 },
    createdAt: new Date().toISOString(),
    ...data,
  }
  await bookingsApi.create(booking)
  await pushNotification({
    userId: booking.userId,
    title: 'Booking Request Received',
    message: `Your request for ${booking.serviceName} has been received. We're matching you with available staff.`,
  })
  return booking
}

export async function matchStaffForBooking(booking) {
  const staff = await staffApi.list()
  return staff
    .filter((s) => s.status === 'active' && s.categories.includes(booking.categoryId))
    .sort((a, b) => b.rating - a.rating)
}

export async function confirmBookingMatch(bookingId, staffId) {
  const staff = await staffApi.get(staffId)
  const patch = { status: 'confirmed', staffId }
  const existing = await bookingsApi.get(bookingId)
  if (staff?.hourlyRate) {
    patch.payment = { ...existing.payment, amount: staff.hourlyRate }
  }
  const booking = await bookingsApi.update(bookingId, patch)
  await pushNotification({
    userId: booking.userId,
    title: 'Booking Confirmed',
    message: `${staff?.name ?? 'A caregiver'} has been assigned to your booking for ${booking.serviceName}.`,
  })
  return booking
}

export async function cancelBooking(bookingId) {
  const booking = await bookingsApi.update(bookingId, { status: 'cancelled' })
  await pushNotification({
    userId: booking.userId,
    title: 'Booking Cancelled',
    message: `Your booking for ${booking.serviceName} has been cancelled.`,
  })
  return booking
}

export async function submitReview(bookingId, { rating, comment }) {
  return bookingsApi.update(bookingId, {
    review: { rating, comment, createdAt: new Date().toISOString() },
  })
}

export function getStaffAverageRating(staffId, bookings, fallback = 0) {
  const reviewed = bookings.filter((b) => b.staffId === staffId && b.review?.rating)
  if (reviewed.length === 0) return fallback
  const sum = reviewed.reduce((total, b) => total + b.review.rating, 0)
  return Math.round((sum / reviewed.length) * 10) / 10
}

export async function payForBooking(bookingId, amount) {
  const booking = await bookingsApi.update(bookingId, {
    payment: { status: 'paid', amount },
  })
  await pushNotification({
    userId: booking.userId,
    title: 'Payment Confirmed',
    message: `We received your payment of ₹${amount}. Invoice generated for booking #${bookingId}.`,
  })
  return booking
}

export async function requestCheckInOtp(bookingId) {
  const otp = generateOtp()
  await bookingsApi.update(bookingId, { checkInOtp: otp })
  return otp
}

export async function verifyCheckIn(bookingId, otpEntered) {
  const booking = await bookingsApi.get(bookingId)
  if (!booking || !/^\d{4}$/.test(otpEntered)) {
    return { ok: false, message: 'Enter the 4-digit passcode shared by the care seeker.' }
  }
  await bookingsApi.update(bookingId, {
    checkIn: new Date().toISOString(),
    status: 'in-progress',
    checkInOtp: null,
  })
  return { ok: true }
}

export async function verifyCheckOut(bookingId, otpEntered) {
  const booking = await bookingsApi.get(bookingId)
  if (!booking || !/^\d{4}$/.test(otpEntered)) {
    return { ok: false, message: 'Enter the 4-digit passcode shared by the care seeker.' }
  }
  await bookingsApi.update(bookingId, {
    checkOut: new Date().toISOString(),
    status: 'completed',
    checkInOtp: null,
  })
  return { ok: true }
}

export async function createStaffAccount(data, createdBy) {
  const staff = {
    id: genId('staff'),
    status: 'active',
    rating: 0,
    experienceYears: 0,
    hourlyRate: 300,
    serviceRadiusKm: 10,
    available: true,
    createdBy,
    ...data,
  }
  await staffApi.create(staff)
  return staff
}

// Caregivers are independent contractors who sign themselves up. They land as
// 'pending' and stay out of booking matches until an Admin approves them.
export async function registerCaregiver(data) {
  const existing = await staffApi.list()
  if (existing.some((s) => s.phone === data.phone)) {
    return { ok: false, message: 'A caregiver account already exists for this mobile number.' }
  }
  const caregiver = await createStaffAccount(
    {
      ...data,
      status: 'pending',
      // Documents are collected during registration now, so an Admin has
      // something to verify the moment the application lands in the queue.
      // Defaulted rather than forced empty, since the caller supplies them.
      documents: data.documents ?? [],
      registeredAt: new Date().toISOString(),
    },
    'self-registered'
  )
  return { ok: true, caregiver }
}

export async function approveCaregiver(staffId) {
  return staffApi.update(staffId, { status: 'active' })
}

export async function sendChatMessage({ staffId, userId, userName, from, text }) {
  const message = {
    id: genId('msg'),
    staffId,
    userId,
    userName,
    from,
    text,
    createdAt: new Date().toISOString(),
  }
  await chatMessagesApi.create(message)
  return message
}

export async function getChatThread(staffId, userId) {
  const all = await chatMessagesApi.list()
  return all
    .filter((m) => m.staffId === staffId && m.userId === userId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export async function getStaffChatThreads(staffId) {
  const all = await chatMessagesApi.list()
  const byUser = {}
  all
    .filter((m) => m.staffId === staffId)
    .forEach((m) => {
      if (!byUser[m.userId]) byUser[m.userId] = { userId: m.userId, userName: m.userName, messages: [] }
      byUser[m.userId].messages.push(m)
    })
  return Object.values(byUser)
    .map((thread) => {
      const messages = thread.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      return { ...thread, messages, lastMessage: messages[messages.length - 1] }
    })
    .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
}

export async function createAdminAccount(data) {
  const admin = {
    id: genId('admin'),
    role: 'admin',
    status: 'active',
    ...data,
  }
  await adminsApi.create(admin)
  return admin
}
