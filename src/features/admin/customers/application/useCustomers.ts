import { useQuery } from '@tanstack/react-query'
import { DEFAULT_PAGE_SIZE } from '@/shared/admin/config/constants'
import { customersApi } from '../data/customersApi'
import { looksLikePhone, normalizePhone } from '../domain/rules'
import type { CustomerStatus } from '../domain/types'
import { customerKeys } from './queryKeys'

export function useCustomers({
  search,
  status,
  pendingAccount,
  page,
}: {
  search: string
  status?: CustomerStatus
  pendingAccount?: boolean
  page: number
}) {
  const term = search.trim()
  const params = {
    search: looksLikePhone(term) ? normalizePhone(term) : term,
    status,
    pendingAccount,
    page,
    size: DEFAULT_PAGE_SIZE,
  }
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.list(params),
    placeholderData: (prev) => prev,
  })
}
