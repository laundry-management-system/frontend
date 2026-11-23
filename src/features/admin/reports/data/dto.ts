import type {
  OperationsReport,
  OrderReport,
  OverviewReport,
  ReportChannel,
  ShiftRow,
} from '../domain/types'

/** Tiền là BigDecimal của BE: có thể về dạng số hoặc chuỗi */
type Money = number | string

interface RevenueSummaryDto {
  cash: Money
  bankTransfer: Money
  total: Money
  paymentCount: number
  cashCount?: number
  bankTransferCount?: number
}

interface OverviewTotalsDto {
  receivedOrders: number
  revenueTotal: Money
  newCustomers: number
  newIncidents: number
}

export interface OverviewResponseDto {
  from: string
  to: string
  live: OverviewReport['live']
  period: OverviewTotalsDto
  previous: OverviewTotalsDto
}

export interface RevenueReportResponseDto {
  from: string
  to: string
  granularity: 'DAY' | 'WEEK' | 'MONTH'
  rows: {
    period: string
    cash: Money
    bankTransfer: Money
    online: Money
    offline: Money
    total: Money
    paymentCount: number
  }[]
  previous: { from: string; to: string; total: Money; paidOrders: number }
  summary: RevenueSummaryDto & {
    paidOrders: number
    byChannel: { channel: ReportChannel; total: Money; paymentCount: number }[]
  }
}

export interface RevenuePaymentDto {
  paymentId: number
  paidAt: string
  method: 'CASH' | 'BANK_TRANSFER'
  amount: Money
  invoiceNo: string
  orderId: number
  orderCode: string
  customerName: string
  channel: ReportChannel
}

export interface OrderReportResponseDto {
  from: string
  to: string
  granularity: 'DAY' | 'MONTH'
  summary: {
    totalOrders: number
    deliveredOrders: number
    cancelledOrders: number
    activeOrders: number
    dueOrders: number
    lateOrders: number
    lateRatePercent: Money | null
    ordersTotalAmount: Money
    itemsRevenue: Money
    byChannel: { channel: ReportChannel; orders: number; revenue: Money }[]
  }
  previous: { totalOrders: number }
  cancelReasons: OrderReport['cancelReasons']
  processing: {
    completedOrders: number
    avgHours: Money | null
    medianHours: Money | null
    onTimeOrders: number
    onTimeRatePercent: Money | null
  }
  byWashMode: { washModeId: number; washModeName: string; orders: number; amount: Money }[]
  online: {
    requests: number
    confirmed: number
    cancelled: number
    confirmRatePercent: Money | null
    avgConfirmMinutes: Money | null
  } | null
  byStatus: OrderReport['byStatus']
  rows: { period: string; received: number }[]
  byService: {
    serviceId: number | null
    serviceCode: string | null
    serviceName: string
    orderCount: number
    quantity: Money
    unit: 'KG' | 'PIECE' | 'SET' | 'PRODUCT' | null
    revenue: Money
  }[]
}

export interface CustomerSpendingDto {
  customerId: number
  customerCode: string
  customerName: string
  orderCount: number
  spent: Money
  lastOrderAt: string | null
}

export interface CustomerReportResponseDto {
  newCustomers: number
  returningCustomers: number
  returnRatePercent: Money | null
  registrations: number
  previous: { newCustomers: number }
  topCustomers: CustomerSpendingDto[]
}

export interface PromotionReportResponseDto {
  uses: number
  discountTotal: Money
  revenue: Money
  byVoucher: {
    voucherCode: string
    voucherId: number | null
    uses: number
    discountTotal: Money
    revenue: Money
  }[]
}

export interface OperationsReportResponseDto {
  byStaff: OperationsReport['byStaff']
  shifts: {
    closed: number
    short: number
    over: number
    differenceTotal: Money
    handInTotal: Money
  }
  shiftRows: (Omit<ShiftRow, 'difference' | 'handInCash'> & {
    difference: Money
    handInCash: Money
  })[]
  incidents: Omit<OperationsReport['incidents'], 'payouts'> & {
    payouts: { cash: Money; bankTransfer: Money }
  }
  previous: { incidentsTotal: number }
}
