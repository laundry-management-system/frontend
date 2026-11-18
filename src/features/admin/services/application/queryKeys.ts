import type { ServiceListParams } from '../data/servicesApi'
import type { PriceHistoryFilter } from '../domain/types'

export const serviceKeys = {
  all: ['services'] as const,
  list: (params: ServiceListParams) => [...serviceKeys.all, 'list', params] as const,
  active: () => [...serviceKeys.all, 'active'] as const,
  // Nằm dưới `all` nên lưu dịch vụ là invalidate luôn lịch sử giá
  priceHistory: (filter: PriceHistoryFilter) =>
    [...serviceKeys.all, 'price-history', filter] as const,
  priceTimeline: (serviceId: number) => [...serviceKeys.all, 'price-timeline', serviceId] as const,
  priceIssued: () => [...serviceKeys.all, 'price-issued'] as const,
}
