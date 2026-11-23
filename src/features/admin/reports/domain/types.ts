/** Cùng giá trị với ReportChannel của feature orders */
export type ReportChannel = 'ONLINE' | 'OFFLINE'

export interface DateRange {
  /** yyyy-MM-dd, gồm cả hai đầu */
  from: string
  to: string
}

export interface RevenueSummary {
  cash: number
  bankTransfer: number
  total: number
  paymentCount: number
}

/** count: số thanh toán (doanh thu) hoặc số đơn (báo cáo đơn) */
export interface ChannelRow {
  channel: ReportChannel
  count: number
  amount: number
}

export interface OverviewTotals {
  receivedOrders: number
  revenueTotal: number
  newCustomers: number
  newIncidents: number
}

export interface OverviewReport extends DateRange {
  live: {
    waiting: number
    processing: number
    readyForPickup: number
    pendingConfirmation: number
    awaitingDropoff: number
    lateOrders: number
    storedOrders: number
    storedAfterDays: number
    dueSoon: {
      orderId: number
      orderCode: string
      customerName: string
      status: string
      dueAt: string
    }[]
    stored: {
      orderId: number
      orderCode: string
      customerName: string
      readyAt: string
      daysWaiting: number
    }[]
  }
  period: OverviewTotals
  previous: OverviewTotals
}

export interface RevenuePayment {
  paymentId: number
  paidAt: string
  method: 'CASH' | 'BANK_TRANSFER'
  amount: number
  invoiceNo: string
  orderId: number
  orderCode: string
  customerName: string
  channel: ReportChannel
}

export type ReportMode = 'day' | 'month'

export interface ReportPeriod extends DateRange {
  mode: ReportMode
}

export interface RevenueRow {
  /** yyyy-MM-dd hoặc yyyy-MM */
  period: string
  cash: number
  bankTransfer: number
  online: number
  offline: number
  total: number
  paymentCount: number
}

export interface RevenueReport {
  rows: RevenueRow[]
  summary: RevenueSummary & { cashCount: number; bankTransferCount: number; paidOrders: number }
  previous: DateRange & { total: number; paidOrders: number }
  byChannel: ChannelRow[]
}

export interface ServiceRow {
  /** null: dòng đồ không gắn dịch vụ ("Khác") */
  serviceId: number | null
  serviceName: string
  orderCount: number
  quantity: number
  unit: 'KG' | 'PIECE' | 'SET' | 'PRODUCT' | null
  revenue: number
}

export interface OrderReport {
  summary: {
    totalOrders: number
    deliveredOrders: number
    cancelledOrders: number
    activeOrders: number
    dueOrders: number
    lateOrders: number
    lateRatePercent: number | null
    ordersTotalAmount: number
    itemsRevenue: number
  }
  previous: { totalOrders: number }
  cancelReasons: { code: string; label: string; count: number }[]
  processing: {
    completedOrders: number
    avgHours: number | null
    medianHours: number | null
    onTimeOrders: number
    onTimeRatePercent: number | null
  }
  byWashMode: { washModeId: number; washModeName: string; orders: number; amount: number }[]
  /** null khi channel = OFFLINE */
  online: {
    requests: number
    confirmed: number
    cancelled: number
    confirmRatePercent: number | null
    avgConfirmMinutes: number | null
  } | null
  byStatus: { status: string; description: string; count: number }[]
  rows: { period: string; count: number }[]
  byService: ServiceRow[]
  byChannel: ChannelRow[]
}

export interface CustomerSpendingRow {
  customerId: number
  customerCode: string
  customerName: string
  orderCount: number
  spent: number
  lastOrderAt: string | null
}

export interface CustomerReport {
  newCustomers: number
  returningCustomers: number
  returnRatePercent: number | null
  registrations: number
  previous: { newCustomers: number }
  topCustomers: CustomerSpendingRow[]
}

export interface VoucherRow {
  voucherCode: string
  voucherId: number | null
  uses: number
  discountTotal: number
  revenue: number
}

export interface PromotionReport {
  uses: number
  discountTotal: number
  revenue: number
  byVoucher: VoucherRow[]
}

export interface ShiftRow {
  shiftId: number
  code: string
  openedByName: string
  closedAt: string
  status: 'CLOSED' | 'APPROVED'
  difference: number
  handInCash: number
}

export interface OperationsReport {
  byStaff: { username: string; fullName: string | null; orders: number }[]
  shifts: {
    closed: number
    short: number
    over: number
    differenceTotal: number
    handInTotal: number
  }
  shiftRows: ShiftRow[]
  incidents: {
    total: number
    rows: { period: string; count: number }[]
    byType: { type: string; count: number }[]
    payouts: { cash: number; bankTransfer: number }
  }
  previous: { incidentsTotal: number }
}
