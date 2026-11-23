import type {
  CustomerReport,
  CustomerSpendingRow,
  OperationsReport,
  OrderReport,
  OverviewReport,
  PromotionReport,
  RevenuePayment,
  RevenueReport,
} from '../domain/types'
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

const num = (v: number | string | null) => (v === null ? null : Number(v))

const toTotals = (t: OverviewResponseDto['period']) => ({
  ...t,
  revenueTotal: Number(t.revenueTotal),
})

export const toOverview = (dto: OverviewResponseDto): OverviewReport => ({
  ...dto,
  period: toTotals(dto.period),
  previous: toTotals(dto.previous),
})

export const toRevenueReport = (dto: RevenueReportResponseDto): RevenueReport => ({
  rows: dto.rows.map((r) => ({
    period: r.period,
    cash: Number(r.cash),
    bankTransfer: Number(r.bankTransfer),
    online: Number(r.online),
    offline: Number(r.offline),
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
    paidOrders: dto.summary.paidOrders,
  },
  previous: { ...dto.previous, total: Number(dto.previous.total) },
  byChannel: dto.summary.byChannel.map((c) => ({
    channel: c.channel,
    count: c.paymentCount,
    amount: Number(c.total),
  })),
})

export const toRevenuePayment = (dto: RevenuePaymentDto): RevenuePayment => ({
  ...dto,
  amount: Number(dto.amount),
})

export const toOrderReport = (dto: OrderReportResponseDto): OrderReport => ({
  summary: {
    ...dto.summary,
    lateRatePercent: num(dto.summary.lateRatePercent),
    ordersTotalAmount: Number(dto.summary.ordersTotalAmount),
    itemsRevenue: Number(dto.summary.itemsRevenue),
  },
  previous: dto.previous,
  cancelReasons: dto.cancelReasons,
  processing: {
    ...dto.processing,
    avgHours: num(dto.processing.avgHours),
    medianHours: num(dto.processing.medianHours),
    onTimeRatePercent: num(dto.processing.onTimeRatePercent),
  },
  byWashMode: dto.byWashMode.map((w) => ({ ...w, amount: Number(w.amount) })),
  online: dto.online && {
    ...dto.online,
    confirmRatePercent: num(dto.online.confirmRatePercent),
    avgConfirmMinutes: num(dto.online.avgConfirmMinutes),
  },
  byStatus: dto.byStatus,
  rows: dto.rows.map((r) => ({ period: r.period, count: r.received })),
  byChannel: dto.summary.byChannel.map((c) => ({
    channel: c.channel,
    count: c.orders,
    amount: Number(c.revenue),
  })),
  byService: dto.byService.map((s) => ({
    serviceId: s.serviceId,
    serviceName: s.serviceName,
    orderCount: s.orderCount,
    quantity: Number(s.quantity),
    unit: s.unit,
    revenue: Number(s.revenue),
  })),
})

export const toCustomerSpending = (dto: CustomerSpendingDto): CustomerSpendingRow => ({
  ...dto,
  spent: Number(dto.spent),
})

export const toCustomerReport = (dto: CustomerReportResponseDto): CustomerReport => ({
  ...dto,
  returnRatePercent: num(dto.returnRatePercent),
  topCustomers: dto.topCustomers.map(toCustomerSpending),
})

export const toPromotionReport = (dto: PromotionReportResponseDto): PromotionReport => ({
  uses: dto.uses,
  discountTotal: Number(dto.discountTotal),
  revenue: Number(dto.revenue),
  byVoucher: dto.byVoucher.map((v) => ({
    ...v,
    discountTotal: Number(v.discountTotal),
    revenue: Number(v.revenue),
  })),
})

export const toOperationsReport = (dto: OperationsReportResponseDto): OperationsReport => ({
  byStaff: dto.byStaff,
  shifts: {
    ...dto.shifts,
    differenceTotal: Number(dto.shifts.differenceTotal),
    handInTotal: Number(dto.shifts.handInTotal),
  },
  shiftRows: dto.shiftRows.map((s) => ({
    ...s,
    difference: Number(s.difference),
    handInCash: Number(s.handInCash),
  })),
  incidents: {
    ...dto.incidents,
    payouts: {
      cash: Number(dto.incidents.payouts.cash),
      bankTransfer: Number(dto.incidents.payouts.bankTransfer),
    },
  },
  previous: dto.previous,
})
