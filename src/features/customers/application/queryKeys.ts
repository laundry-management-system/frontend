import type { CustomerListParams } from '../data/customersApi'

export const customerKeys = {
  all: ['customers'] as const,
  list: (params: CustomerListParams) => [...customerKeys.all, 'list', params] as const,
  detail: (id: number) => [...customerKeys.all, 'detail', id] as const,
  byPhone: (phone: string) => [...customerKeys.all, 'by-phone', phone] as const,
  orders: (phone: string, page: number) => [...customerKeys.all, 'orders', phone, page] as const,
  firstOrder: (phone: string) => [...customerKeys.all, 'orders', phone, 'first'] as const,
}
