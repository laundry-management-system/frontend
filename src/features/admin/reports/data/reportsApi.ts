import { httpClient } from '@/shared/common/api/httpClient'
import type { DateRange, ReportChannel, ReportMode } from '../domain/types'
import type {
  DashboardResponseDto,
  OrderReportResponseDto,
  RevenuePaymentDto,
  RevenueReportResponseDto,
} from './dto'
import { toDashboard, toOrderReport, toRevenuePayment, toRevenueReport } from './mapper'

const GRANULARITY = { day: 'DAY', month: 'MONTH' } as const

export const reportsApi = {
  dashboard: async (range: DateRange) =>
    toDashboard(
      (
        await httpClient.get<DashboardResponseDto>('/reports/dashboard', {
          params: range,
        })
      ).data,
    ),

  revenue: async (range: DateRange, mode: ReportMode, channel?: ReportChannel) =>
    toRevenueReport(
      (
        await httpClient.get<RevenueReportResponseDto>('/reports/revenue', {
          params: { from: range.from, to: range.to, granularity: GRANULARITY[mode], channel },
        })
      ).data,
    ),

  orders: async (range: DateRange, mode: ReportMode, channel?: ReportChannel) =>
    toOrderReport(
      (
        await httpClient.get<OrderReportResponseDto>('/reports/orders', {
          params: { from: range.from, to: range.to, granularity: GRANULARITY[mode], channel },
        })
      ).data,
    ),

  revenuePayments: async (range: DateRange, channel?: ReportChannel) =>
    (
      await httpClient.get<RevenuePaymentDto[]>('/reports/revenue/payments', {
        params: { ...range, channel },
      })
    ).data.map(toRevenuePayment),
}
