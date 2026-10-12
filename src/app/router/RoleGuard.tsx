import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'

/** Dùng bên trong ProtectedRoute: <Route element={<RoleGuard roles={['ADMIN']} />}>. */
export function RoleGuard({ roles }: { roles: string[] }) {
  const userRoles = useAuthStore((s) => s.user?.roles)
  const allowed = userRoles?.some((r) => roles.includes(r)) ?? false
  return allowed ? <Outlet /> : <Navigate to="/" replace />
}
