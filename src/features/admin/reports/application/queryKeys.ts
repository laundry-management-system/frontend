export const reportKeys = {
  all: ['reports'] as const,
  dashboard: (range: object) => [...reportKeys.all, 'dashboard', range] as const,
  revenue: (period: object, channel?: string) =>
    [...reportKeys.all, 'revenue', period, channel] as const,
  orders: (period: object, channel?: string) =>
    [...reportKeys.all, 'orders', period, channel] as const,
  revenuePayments: (range: object, channel?: string) =>
    [...reportKeys.all, 'revenue-payments', range, channel] as const,
}
