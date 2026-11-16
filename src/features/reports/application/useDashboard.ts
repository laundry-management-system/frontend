import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import type { DateRange } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useDashboard(range: DateRange, enabled = true) {
  return useQuery({
    queryKey: reportKeys.dashboard(range),
    queryFn: () => reportsApi.dashboard(range),
    enabled,
    placeholderData: (prev) => prev,
  })
}
