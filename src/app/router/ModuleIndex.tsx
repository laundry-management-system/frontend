import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'
import { homePathFor } from './homePath'
import { firstAllowedPath, type NavModule } from './modules'

/** URL chỉ có tiền tố module (VD `/admin`) → trang con đầu tiên người dùng được vào. */
export function ModuleIndex({ module }: { module: NavModule }) {
  const roles = useAuthStore((s) => s.user?.roles) ?? []
  return <Navigate to={firstAllowedPath(module, roles) ?? homePathFor(roles)} replace />
}
