import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homePathFor, useAuthStore } from '@/features/auth'
import { SessionLoader } from './ProtectedRoute'

/**
 * Trang cho người chưa đăng nhập (/login). Đã đăng nhập (kể cả ngay sau khi bấm Đăng nhập) thì
 * về trang định vào trước đó, không có thì trang chủ theo vai trò; sai vai trò thì RoleGuard chuyển tiếp.
 */
export function GuestRoute() {
  const status = useAuthStore((s) => s.status)
  const roles = useAuthStore((s) => s.user?.roles)
  const from = (useLocation().state as { from?: { pathname: string } } | null)?.from?.pathname
  if (status === 'unknown') return <SessionLoader />
  if (status === 'authenticated') return <Navigate to={from ?? homePathFor(roles ?? [])} replace />
  return <Outlet />
}
