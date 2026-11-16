export const reportKeys = {
  all: ['reports'] as const,
  dashboard: (range: object) => [...reportKeys.all, 'dashboard', range] as const,
  dailyRevenue: (range: object) => [...reportKeys.all, 'daily-revenue', range] as const,
  revenuePayments: (range: object) => [...reportKeys.all, 'revenue-payments', range] as const,
}
