import { Center, Loader } from '@mantine/core'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'

/** Hiện trong lúc đang khôi phục phiên lúc mở app. */
export function SessionLoader() {
  return (
    <Center h="100vh">
      <Loader />
    </Center>
  )
}

/** Chưa đăng nhập thì chuyển về /login, giữ lại trang định vào trong state.from. */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()
  if (status === 'unknown') return <SessionLoader />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
