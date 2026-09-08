import {
  LayoutDashboard,
  CalendarClock,
  Users,
  ShieldCheck,
  FolderKanban,
  FileText,
  UserCog,
  Settings,
  ClipboardList,
  MessageCircle,
} from 'lucide-react'

export const ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
}

// Values are i18next translation keys (not display text) — resolve with t() at render time,
// since this module loads before i18next may have initialized/changed language.
export const ROLE_LABEL = {
  [ROLES.USER]: 'roleLabel.user',
  [ROLES.STAFF]: 'roleLabel.staff',
  [ROLES.ADMIN]: 'roleLabel.admin',
  [ROLES.SUPER_ADMIN]: 'roleLabel.superAdmin',
}

export const ROLE_HOME = {
  [ROLES.USER]: '/user/dashboard',
  [ROLES.STAFF]: '/staff/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
}

// `label` fields below are i18next translation keys — resolve with t(item.label) at render time.
export const STAFF_NAV = [
  { to: '/staff/dashboard', label: 'staffNav.dashboard', icon: LayoutDashboard },
  { to: '/staff/engagements', label: 'staffNav.engagements', icon: CalendarClock },
  { to: '/staff/messages', label: 'staffNav.messages', icon: MessageCircle },
  { to: '/staff/profile', label: 'staffNav.profile', icon: UserCog },
]

export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'adminNav.dashboard', icon: LayoutDashboard },
  { to: '/admin/staff', label: 'adminNav.staffAccounts', icon: Users, badge: 'pendingCaregivers' },
  { to: '/admin/categories', label: 'adminNav.serviceCategories', icon: FolderKanban },
  { to: '/admin/service-pages', label: 'adminNav.servicePagesCms', icon: FileText },
  { to: '/admin/bookings', label: 'adminNav.bookingsOversight', icon: ClipboardList },
]

export const SUPER_ADMIN_NAV = [
  { to: '/super-admin/dashboard', label: 'superAdminNav.dashboard', icon: LayoutDashboard },
  { to: '/super-admin/admins', label: 'superAdminNav.adminAccounts', icon: ShieldCheck },
  { to: '/super-admin/staff', label: 'adminNav.staffAccounts', icon: Users, badge: 'pendingCaregivers' },
  { to: '/super-admin/categories', label: 'adminNav.serviceCategories', icon: FolderKanban },
  { to: '/super-admin/service-pages', label: 'adminNav.servicePagesCms', icon: FileText },
  { to: '/super-admin/bookings', label: 'adminNav.bookingsOversight', icon: ClipboardList },
  { to: '/super-admin/settings', label: 'superAdminNav.systemSettings', icon: Settings },
]

export function roleAllows(sessionRole, allowedRoles) {
  if (!sessionRole) return false
  if (allowedRoles.includes(sessionRole)) return true
  // Super Admin can access anything Admin can (superset access)
  if (sessionRole === ROLES.SUPER_ADMIN && allowedRoles.includes(ROLES.ADMIN)) return true
  return false
}
