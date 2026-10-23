import type { ServiceListParams } from '../data/servicesApi'

export const serviceKeys = {
  all: ['services'] as const,
  list: (params: ServiceListParams) => [...serviceKeys.all, 'list', params] as const,
  active: () => [...serviceKeys.all, 'active'] as const,
}
