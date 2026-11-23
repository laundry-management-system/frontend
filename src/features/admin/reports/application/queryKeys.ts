export const reportKeys = {
  all: ['reports'] as const,
  overview: (period: object, channel?: string) =>
    [...reportKeys.all, 'overview', period, channel] as const,
  revenue: (period: object, channel?: string) =>
    [...reportKeys.all, 'revenue', period, channel] as const,
  orders: (period: object, channel?: string) =>
    [...reportKeys.all, 'orders', period, channel] as const,
  customers: (range: object) => [...reportKeys.all, 'customers', range] as const,
  promotions: (range: object, channel?: string) =>
    [...reportKeys.all, 'promotions', range, channel] as const,
  operations: (period: object) => [...reportKeys.all, 'operations', period] as const,
  revenuePayments: (range: object, channel?: string) =>
    [...reportKeys.all, 'revenue-payments', range, channel] as const,
}
