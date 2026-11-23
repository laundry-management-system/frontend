import { httpClient } from '@/shared/common/api/httpClient'
import type { DateRange, ReportChannel, ReportMode } from '../domain/types'
import type {
  CustomerReportResponseDto,
  CustomerSpendingDto,
  OperationsReportResponseDto,
  PromotionReportResponseDto,
  OrderReportResponseDto,
  OverviewResponseDto,
  RevenuePaymentDto,
  RevenueReportResponseDto,
} from './dto'
import {
  toCustomerReport,
  toCustomerSpending,
  toOperationsReport,
  toOrderReport,
  toOverview,
  toPromotionReport,
  toRevenuePayment,
  toRevenueReport,
} from './mapper'

const TIMEOUT = 35_000
const GRANULARITY = { day: 'DAY', month: 'MONTH' } as const

export const reportsApi = {
  overview: async (range: DateRange) =>
    toOverview(
      (
        await httpClient.get<OverviewResponseDto>('/reports/overview', {
          params: range,
          timeout: TIMEOUT,
        })
      ).data,
    ),

  revenue: async (range: DateRange, mode: ReportMode, channel?: ReportChannel) =>
    toRevenueReport(
      (
        await httpClient.get<RevenueReportResponseDto>('/reports/revenue', {
          params: { from: range.from, to: range.to, granularity: GRANULARITY[mode], channel },
          timeout: TIMEOUT,
        })
      ).data,
    ),

  orders: async (range: DateRange, mode: ReportMode, channel?: ReportChannel) =>
    toOrderReport(
      (
        await httpClient.get<OrderReportResponseDto>('/reports/orders', {
          params: { from: range.from, to: range.to, granularity: GRANULARITY[mode], channel },
          timeout: TIMEOUT,
        })
      ).data,
    ),

  customers: async (range: DateRange) =>
    toCustomerReport(
      (
        await httpClient.get<CustomerReportResponseDto>('/reports/customers', {
          params: range,
          timeout: TIMEOUT,
        })
      ).data,
    ),
  customerSpending: async (range: DateRange) =>
    (
      await httpClient.get<CustomerSpendingDto[]>('/reports/customers/spending', {
        params: range,
        timeout: TIMEOUT,
      })
    ).data.map(toCustomerSpending),
  promotions: async (range: DateRange, channel?: ReportChannel) =>
    toPromotionReport(
      (
        await httpClient.get<PromotionReportResponseDto>('/reports/promotions', {
          params: { ...range, channel },
          timeout: TIMEOUT,
        })
      ).data,
    ),
  operations: async (range: DateRange, mode: ReportMode) =>
    toOperationsReport(
      (
        await httpClient.get<OperationsReportResponseDto>('/reports/operations', {
          params: { ...range, granularity: GRANULARITY[mode] },
          timeout: TIMEOUT,
        })
      ).data,
    ),
  revenuePayments: async (range: DateRange, channel?: ReportChannel) =>
    (
      await httpClient.get<RevenuePaymentDto[]>('/reports/revenue/payments', {
        params: { ...range, channel },
        timeout: TIMEOUT,
      })
    ).data.map(toRevenuePayment),
}
