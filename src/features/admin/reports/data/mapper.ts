import type { Dashboard, OrderReport, RevenuePayment, RevenueReport } from '../domain/types'
import type {
  DashboardResponseDto,
  OrderReportResponseDto,
  RevenuePaymentDto,
  RevenueReportResponseDto,
} from './dto'

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

export const toRevenueReport = (dto: RevenueReportResponseDto): RevenueReport => ({
  rows: dto.rows.map((r) => ({
    period: r.period,
    cash: Number(r.cash),
    bankTransfer: Number(r.bankTransfer),
    total: Number(r.total),
    paymentCount: r.paymentCount,
  })),
  summary: {
    cash: Number(dto.summary.cash),
    bankTransfer: Number(dto.summary.bankTransfer),
    total: Number(dto.summary.total),
    paymentCount: dto.summary.paymentCount,
    cashCount: dto.summary.cashCount ?? 0,
    bankTransferCount: dto.summary.bankTransferCount ?? 0,
  },
})

export const toRevenuePayment = (dto: RevenuePaymentDto): RevenuePayment => ({
  ...dto,
  amount: Number(dto.amount),
})

const statusCount = (dto: OrderReportResponseDto, status: string) =>
  dto.byStatus.find((s) => s.status === status)?.count ?? 0

export const toOrderReport = (dto: OrderReportResponseDto): OrderReport => ({
  summary: {
    totalOrders: dto.summary.totalOrders,
    cancelledOrders: dto.summary.cancelledOrders,
    activeOrders: dto.summary.activeOrders,
    lateOrders: dto.summary.lateOrders,
    lateRatePercent: Number(dto.summary.lateRatePercent),
  },
  delivered: statusCount(dto, 'DELIVERED'),
  processing: statusCount(dto, 'PROCESSING'),
  rows: dto.rows,
  byService: dto.byService.map((s) => ({
    serviceId: s.serviceId,
    serviceName: s.serviceName,
    orderCount: s.orderCount,
    quantity: Number(s.quantity),
    unit: s.unit,
    revenue: Number(s.revenue),
  })),
})
