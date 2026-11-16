import type { DailyRevenue, Dashboard, RevenuePayment } from '../domain/types'
import type { DashboardResponseDto, RevenuePaymentDto, RevenueReportResponseDto } from './dto'

export const toDashboard = (dto: DashboardResponseDto): Dashboard => ({
  from: dto.from,
  to: dto.to,
  orders: dto.orders,
  revenue: {
    cash: Number(dto.revenue.cash),
    bankTransfer: Number(dto.revenue.bankTransfer),
    total: Number(dto.revenue.total),
    paymentCount: dto.revenue.paymentCount,
  },
  alerts: dto.alerts,
  previous: { ...dto.previous, revenueTotal: Number(dto.previous.revenueTotal) },
})

export const toDailyRevenue = (dto: RevenueReportResponseDto): DailyRevenue[] =>
  dto.rows.map((r) => ({
    date: r.period,
    cash: Number(r.cash),
    bankTransfer: Number(r.bankTransfer),
    total: Number(r.total),
  }))

export const toRevenuePayment = (dto: RevenuePaymentDto): RevenuePayment => ({
  ...dto,
  amount: Number(dto.amount),
})
