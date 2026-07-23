import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, homePathForRole } from './AuthContext'
import type { Role } from './types'
import { SplashLoader } from '@/components/ui'

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return <Outlet />
}

export function GuestOnly() {
  const { user, isAuthenticated } = useAuth()
  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }
  return <Outlet />
}

/** Tiny suspense-friendly placeholder for future lazy routes */
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <SplashLoader />
    </div>
  )
}
