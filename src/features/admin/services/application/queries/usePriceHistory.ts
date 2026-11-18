import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../../data/servicesApi'
import type { PriceHistoryFilter } from '../../domain/types'
import { serviceKeys } from '../queryKeys'

export function usePriceHistory(filter: PriceHistoryFilter) {
  return useQuery({
    queryKey: serviceKeys.priceHistory(filter),
    queryFn: () => servicesApi.priceHistory(filter),
    placeholderData: (prev) => prev,
  })
}
