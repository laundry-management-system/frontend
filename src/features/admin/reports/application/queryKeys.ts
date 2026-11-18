export const reportKeys = {
  all: ['reports'] as const,
  dashboard: (range: object) => [...reportKeys.all, 'dashboard', range] as const,
  revenue: (period: object) => [...reportKeys.all, 'revenue', period] as const,
  orders: (period: object) => [...reportKeys.all, 'orders', period] as const,
  revenuePayments: (range: object) => [...reportKeys.all, 'revenue-payments', range] as const,
}
