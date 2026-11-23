import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import type { DateRange } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useCustomerReport(range: DateRange, enabled: boolean) {
  return useQuery({
    queryKey: reportKeys.customers(range),
    queryFn: () => reportsApi.customers(range),
    enabled,
    placeholderData: (prev) => prev,
  })
}
