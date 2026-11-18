import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useCustomerSessionStore } from '@/features/client/customer-account'
import { PATHS } from '@/shared/common/config/paths'

/** Trang chỉ dành cho khách chưa đăng nhập; đang khôi phục phiên thì chưa hiện form. */
export function CustomerGuestRoute({ children }: { children: ReactNode }) {
  const status = useCustomerSessionStore((s) => s.status)
  if (status === 'unknown') return null
  if (status === 'authenticated') return <Navigate to={PATHS.customerAccount} replace />
  return children
}
