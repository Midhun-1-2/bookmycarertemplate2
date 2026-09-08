import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import UserShellLayout from './layouts/UserShellLayout'
import DashboardLayout from './layouts/DashboardLayout'
import RequireRole from './RequireRole'
import { STAFF_NAV, ADMIN_NAV, SUPER_ADMIN_NAV } from './roleConfig'

import HomePage from '../features/home/HomePage'
import ServicesListPage from '../features/services/ServicesListPage'
import CategoryPage from '../features/services/CategoryPage'
import ServiceDetailPage from '../features/services/ServiceDetailPage'
import LoginPage from '../features/auth/LoginPage'
import CaregiverRegisterPage from '../features/auth/CaregiverRegisterPage'

import UserDashboard from '../features/user/UserDashboard'
import BookingFormPage from '../features/booking/BookingFormPage'
import MatchingResultsPage from '../features/booking/MatchingResultsPage'
import CheckoutPage from '../features/payments/CheckoutPage'
import MyBookingsPage from '../features/user/MyBookingsPage'
import BookingDetailPage from '../features/user/BookingDetailPage'
import UserProfilePage from '../features/user/UserProfilePage'

import StaffDashboard from '../features/staff/StaffDashboard'
import StaffEngagementsPage from '../features/staff/StaffEngagementsPage'
import StaffEngagementDetailPage from '../features/staff/StaffEngagementDetailPage'
import StaffMessagesPage from '../features/staff/StaffMessagesPage'
import StaffMessageThreadPage from '../features/staff/StaffMessageThreadPage'
import StaffProfilePage from '../features/staff/StaffProfilePage'

import AdminDashboard from '../features/admin/AdminDashboard'
import AdminStaffAccountsPage from '../features/admin/AdminStaffAccountsPage'
import AdminCategoriesPage from '../features/admin/AdminCategoriesPage'
import AdminServicePagesPage from '../features/admin/AdminServicePagesPage'
import AdminBookingsPage from '../features/admin/AdminBookingsPage'

import SuperAdminDashboard from '../features/super-admin/SuperAdminDashboard'
import SuperAdminAdminsPage from '../features/super-admin/SuperAdminAdminsPage'
import SuperAdminSettingsPage from '../features/super-admin/SuperAdminSettingsPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesListPage />} />
        <Route path="/services/:categorySlug" element={<CategoryPage />} />
        <Route path="/services/:categorySlug/:serviceId" element={<ServiceDetailPage />} />
      </Route>

      <Route path="/login/user" element={<LoginPage role="user" />} />
      <Route path="/login/staff" element={<LoginPage role="staff" />} />
      <Route path="/login/admin" element={<LoginPage role="admin" />} />
      <Route path="/login/super-admin" element={<LoginPage role="super-admin" />} />

      <Route path="/become-a-caregiver" element={<CaregiverRegisterPage />} />

      <Route
        path="/user"
        element={
          <RequireRole allow={['user']} fallback="/">
            <UserShellLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="book/:categorySlug/:serviceId" element={<BookingFormPage />} />
        <Route path="book/:bookingId/match" element={<MatchingResultsPage />} />
        <Route path="book/:bookingId/checkout" element={<CheckoutPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="bookings/:bookingId" element={<BookingDetailPage />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>

      <Route
        path="/staff"
        element={
          <RequireRole allow={['staff']}>
            <DashboardLayout navItems={STAFF_NAV} />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="engagements" element={<StaffEngagementsPage />} />
        <Route path="engagements/:bookingId" element={<StaffEngagementDetailPage />} />
        <Route path="messages" element={<StaffMessagesPage />} />
        <Route path="messages/:userId" element={<StaffMessageThreadPage />} />
        <Route path="profile" element={<StaffProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole allow={['admin']}>
            <DashboardLayout navItems={ADMIN_NAV} />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="staff" element={<AdminStaffAccountsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="service-pages" element={<AdminServicePagesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
      </Route>

      <Route
        path="/super-admin"
        element={
          <RequireRole allow={['super-admin']}>
            <DashboardLayout navItems={SUPER_ADMIN_NAV} />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="admins" element={<SuperAdminAdminsPage />} />
        <Route path="staff" element={<AdminStaffAccountsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="service-pages" element={<AdminServicePagesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="settings" element={<SuperAdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
