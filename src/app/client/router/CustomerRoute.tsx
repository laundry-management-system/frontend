import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCustomerSessionStore } from '@/features/client/customer-account'
import { PATHS } from '@/shared/common/config/paths'

export function CustomerRoute({ children }: { children: ReactNode }) {
  const status = useCustomerSessionStore((s) => s.status)
  const location = useLocation()
  if (status === 'unknown') return null
  if (status === 'anonymous')
    return <Navigate to={PATHS.customerLogin} state={{ from: location }} replace />
  return children
}
