import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import type { DateRange } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useRevenuePayments(range: DateRange) {
  return useQuery({
    queryKey: reportKeys.revenuePayments(range),
    queryFn: () => reportsApi.revenuePayments(range),
  })
}
