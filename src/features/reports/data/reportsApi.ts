import { httpClient } from '@/shared/api/httpClient'
import type { DateRange } from '../domain/types'
import type { DashboardResponseDto, RevenuePaymentDto, RevenueReportResponseDto } from './dto'
import { toDailyRevenue, toDashboard, toRevenuePayment } from './mapper'

export const reportsApi = {
  dashboard: async (range: DateRange) =>
    toDashboard((await httpClient.get<DashboardResponseDto>('/reports/dashboard', { params: range })).data),

  dailyRevenue: async (range: DateRange) =>
    toDailyRevenue(
      (
        await httpClient.get<RevenueReportResponseDto>('/reports/revenue', {
          params: { ...range, granularity: 'DAY' },
        })
      ).data,
    ),

  revenuePayments: async (range: DateRange) =>
    (await httpClient.get<RevenuePaymentDto[]>('/reports/revenue/payments', { params: range })).data.map(
      toRevenuePayment,
    ),
}
