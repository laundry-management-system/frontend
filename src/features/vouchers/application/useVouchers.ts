import { useQuery } from '@tanstack/react-query'
import { DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import { vouchersApi } from '../data/vouchersApi'
import { voucherKeys } from './queryKeys'

export function useVouchers({ search, page }: { search: string; page: number }) {
  const params = { search: search.trim(), page, size: DEFAULT_PAGE_SIZE }
  return useQuery({
    queryKey: voucherKeys.list(params),
    queryFn: () => vouchersApi.list(params),
    placeholderData: (prev) => prev,
  })
}
