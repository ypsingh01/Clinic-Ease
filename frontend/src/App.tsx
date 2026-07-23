import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/auth/AuthContext'
import { PatientDataProvider } from '@/patient/PatientDataContext'
import { DoctorDataProvider } from '@/doctor/DoctorDataContext'
import { AdminDataProvider } from '@/admin/AdminDataContext'
import { ClinicProvider } from '@/clinic/ApiClinicProvider'
import { I18nProvider } from '@/i18n/I18nContext'
import { GuestOnly, ProtectedRoute } from '@/auth/ProtectedRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PatientLayout } from '@/layouts/PatientLayout'
import { DoctorLayout } from '@/layouts/DoctorLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BootSplash } from '@/components/brand/BootSplash'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'

const WelcomePage = lazy(() =>
  import('@/pages/WelcomePage').then((m) => ({ default: m.WelcomePage })),
)
const DesignFoundationPage = lazy(() =>
  import('@/pages/dev/DesignFoundationPage').then((m) => ({ default: m.DesignFoundationPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const OtpPage = lazy(() => import('@/pages/auth/OtpPage').then((m) => ({ default: m.OtpPage })))

const PatientHomePage = lazy(() =>
  import('@/pages/patient/PatientHomePage').then((m) => ({ default: m.PatientHomePage })),
)
const DoctorsPage = lazy(() =>
  import('@/pages/patient/DoctorsPage').then((m) => ({ default: m.DoctorsPage })),
)
const DoctorDetailPage = lazy(() =>
  import('@/pages/patient/DoctorDetailPage').then((m) => ({ default: m.DoctorDetailPage })),
)
const BookPage = lazy(() =>
  import('@/pages/patient/BookPage').then((m) => ({ default: m.BookPage })),
)
const AppointmentsPage = lazy(() =>
  import('@/pages/patient/AppointmentsPage').then((m) => ({ default: m.AppointmentsPage })),
)
const WaitlistPage = lazy(() =>
  import('@/pages/patient/WaitlistPage').then((m) => ({ default: m.WaitlistPage })),
)
const NotificationsPage = lazy(() =>
  import('@/pages/patient/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)
const DependentsPage = lazy(() =>
  import('@/pages/patient/DependentsPage').then((m) => ({ default: m.DependentsPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/patient/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

const DoctorHomePage = lazy(() =>
  import('@/pages/doctor/DoctorHomePage').then((m) => ({ default: m.DoctorHomePage })),
)
const DoctorAvailabilityPage = lazy(() =>
  import('@/pages/doctor/DoctorAvailabilityPage').then((m) => ({
    default: m.DoctorAvailabilityPage,
  })),
)
const DoctorAnalyticsPage = lazy(() =>
  import('@/pages/doctor/DoctorAnalyticsPage').then((m) => ({ default: m.DoctorAnalyticsPage })),
)
const DoctorSettingsPage = lazy(() =>
  import('@/pages/doctor/DoctorSettingsPage').then((m) => ({ default: m.DoctorSettingsPage })),
)

const AdminHomePage = lazy(() =>
  import('@/pages/admin/AdminHomePage').then((m) => ({ default: m.AdminHomePage })),
)
const AdminDoctorsPage = lazy(() =>
  import('@/pages/admin/AdminDoctorsPage').then((m) => ({ default: m.AdminDoctorsPage })),
)
const AdminAppointmentsPage = lazy(() =>
  import('@/pages/admin/AdminAppointmentsPage').then((m) => ({
    default: m.AdminAppointmentsPage,
  })),
)
const AdminBookPage = lazy(() =>
  import('@/pages/admin/AdminBookPage').then((m) => ({ default: m.AdminBookPage })),
)
const AdminRevenuePage = lazy(() =>
  import('@/pages/admin/AdminRevenuePage').then((m) => ({ default: m.AdminRevenuePage })),
)
const AdminReportsPage = lazy(() =>
  import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })),
)
const AdminNotificationsPage = lazy(() =>
  import('@/pages/admin/AdminNotificationsPage').then((m) => ({
    default: m.AdminNotificationsPage,
  })),
)
const AdminAnalyticsPage = lazy(() =>
  import('@/pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })),
)

function PatientProviders() {
  return (
    <PatientDataProvider>
      <Outlet />
    </PatientDataProvider>
  )
}

function DoctorProviders() {
  return (
    <DoctorDataProvider>
      <Outlet />
    </DoctorDataProvider>
  )
}

function AdminProviders() {
  return (
    <AdminDataProvider>
      <Outlet />
    </AdminDataProvider>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <BrandLoader fullScreen={false} className="w-full max-w-md" />
    </div>
  )
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <ErrorBoundary>
      <BootSplash>
        <ToastProvider>
          <I18nProvider>
            <AuthProvider>
              <ClinicProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/welcome"
                element={
                  <Lazy>
                    <WelcomePage />
                  </Lazy>
                }
              />
              <Route
                path="/dev/ui"
                element={
                  import.meta.env.PROD ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Lazy>
                      <DesignFoundationPage />
                    </Lazy>
                  )
                }
              />

              <Route element={<GuestOnly />}>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/register"
                    element={
                      <Lazy>
                        <RegisterPage />
                      </Lazy>
                    }
                  />
                  <Route
                    path="/otp"
                    element={
                      <Lazy>
                        <OtpPage />
                      </Lazy>
                    }
                  />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['patient']} />}>
                <Route element={<PatientProviders />}>
                  <Route path="/patient" element={<PatientLayout />}>
                    <Route
                      index
                      element={
                        <Lazy>
                          <PatientHomePage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="doctors"
                      element={
                        <Lazy>
                          <DoctorsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="doctors/:doctorId"
                      element={
                        <Lazy>
                          <DoctorDetailPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="book"
                      element={
                        <Lazy>
                          <BookPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="book/:doctorId"
                      element={
                        <Lazy>
                          <BookPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="appointments"
                      element={
                        <Lazy>
                          <AppointmentsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="waitlist"
                      element={
                        <Lazy>
                          <WaitlistPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="notifications"
                      element={
                        <Lazy>
                          <NotificationsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="dependents"
                      element={
                        <Lazy>
                          <DependentsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <Lazy>
                          <ProfilePage />
                        </Lazy>
                      }
                    />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['doctor']} />}>
                <Route element={<DoctorProviders />}>
                  <Route path="/doctor" element={<DoctorLayout />}>
                    <Route
                      index
                      element={
                        <Lazy>
                          <DoctorHomePage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="availability"
                      element={
                        <Lazy>
                          <DoctorAvailabilityPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="analytics"
                      element={
                        <Lazy>
                          <DoctorAnalyticsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <Lazy>
                          <DoctorSettingsPage />
                        </Lazy>
                      }
                    />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route element={<AdminProviders />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={
                        <Lazy>
                          <AdminHomePage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="doctors"
                      element={
                        <Lazy>
                          <AdminDoctorsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="appointments"
                      element={
                        <Lazy>
                          <AdminAppointmentsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="book"
                      element={
                        <Lazy>
                          <AdminBookPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="revenue"
                      element={
                        <Lazy>
                          <AdminRevenuePage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="reports"
                      element={
                        <Lazy>
                          <AdminReportsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="notifications"
                      element={
                        <Lazy>
                          <AdminNotificationsPage />
                        </Lazy>
                      }
                    />
                    <Route
                      path="analytics"
                      element={
                        <Lazy>
                          <AdminAnalyticsPage />
                        </Lazy>
                      }
                    />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
                </BrowserRouter>
              </ClinicProvider>
            </AuthProvider>
          </I18nProvider>
        </ToastProvider>
      </BootSplash>
    </ErrorBoundary>
  )
}
