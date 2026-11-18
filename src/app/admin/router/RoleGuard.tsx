import { Navigate, Outlet } from 'react-router-dom'
import { type Role, useAuthStore } from '@/features/admin/auth'
import { homePathFor } from './homePath'

/** Dùng bên trong ProtectedRoute: <Route element={<RoleGuard roles={['ADMIN']} />}>. */
export function RoleGuard({ roles }: { roles: Role[] }) {
  const userRoles = useAuthStore((s) => s.user?.roles) ?? []
  const allowed = userRoles.some((r) => roles.includes(r))
  return allowed ? <Outlet /> : <Navigate to={homePathFor(userRoles)} replace />
}
