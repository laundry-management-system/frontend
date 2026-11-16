import { httpClient } from '@/shared/api/httpClient'
import type { DateRange, ReportMode } from '../domain/types'
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
      (await httpClient.get<DashboardResponseDto>('/reports/dashboard', { params: range })).data,
    ),

  revenue: async (range: DateRange, mode: ReportMode) =>
    toRevenueReport(
      (
        await httpClient.get<RevenueReportResponseDto>('/reports/revenue', {
          params: { from: range.from, to: range.to, granularity: GRANULARITY[mode] },
        })
      ).data,
    ),

  orders: async (range: DateRange, mode: ReportMode) =>
    toOrderReport(
      (
        await httpClient.get<OrderReportResponseDto>('/reports/orders', {
          params: { from: range.from, to: range.to, granularity: GRANULARITY[mode] },
        })
      ).data,
    ),

  revenuePayments: async (range: DateRange) =>
    (
      await httpClient.get<RevenuePaymentDto[]>('/reports/revenue/payments', { params: range })
    ).data.map(toRevenuePayment),
}
