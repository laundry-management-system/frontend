import { Center, Loader } from '@mantine/core'
import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasSessionHint, useAuthStore } from '@/features/admin/auth'

/** Hiện trong lúc đang khôi phục phiên lúc mở app. */
export function SessionLoader() {
  return (
    <Center h="100vh">
      <Loader />
    </Center>
  )
}

/**
 * Chưa đăng nhập thì chuyển về /login, giữ lại trang định vào trong state.from.
 * Riêng `/` thì khách thấy landing; máy từng có phiên vẫn chờ khôi phục để nhân viên không thấy landing nháy lên.
 */
export function ProtectedRoute({ landing }: { landing: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()
  const isRoot = location.pathname === '/'
  if (isRoot && (status === 'anonymous' || (status === 'unknown' && !hasSessionHint())))
    return landing
  if (status === 'unknown') return <SessionLoader />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
