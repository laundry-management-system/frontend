import { Navigate, Outlet } from 'react-router-dom'
import { homePathFor, type Role, useAuthStore } from '@/features/auth'

/** Dùng bên trong ProtectedRoute: <Route element={<RoleGuard roles={['ADMIN']} />}>. */
export function RoleGuard({ roles }: { roles: Role[] }) {
  const userRoles = useAuthStore((s) => s.user?.roles) ?? []
  const allowed = userRoles.some((r) => roles.includes(r))
  return allowed ? <Outlet /> : <Navigate to={homePathFor(userRoles)} replace />
}
