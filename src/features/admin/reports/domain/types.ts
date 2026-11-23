/** Cùng giá trị với ReportChannel của feature orders */
export type ReportChannel = 'ONLINE' | 'OFFLINE'

export type DashboardPreset = 'today' | '7d' | 'month'

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

export interface Dashboard extends DateRange {
  orders: {
    received: number
    cancelled: number
    delivered: number
    waiting: number
    processing: number
    readyForPickup: number
    pendingConfirmation: number
    awaitingDropoff: number
  }
  revenue: RevenueSummary
  alerts: { lateOrders: number; storedOrders: number; storedAfterDays: number }
  previous: DateRange & { received: number; revenueTotal: number }
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
  summary: RevenueSummary & { cashCount: number; bankTransferCount: number }
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
    cancelledOrders: number
    activeOrders: number
    lateOrders: number
    lateRatePercent: number
  }
  delivered: number
  processing: number
  rows: { period: string; received: number }[]
  byService: ServiceRow[]
  byChannel: ChannelRow[]
}
