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

export interface Dashboard extends DateRange {
  orders: {
    received: number
    cancelled: number
    delivered: number
    waiting: number
    processing: number
    readyForPickup: number
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
  total: number
  paymentCount: number
}

export interface RevenueReport {
  rows: RevenueRow[]
  summary: RevenueSummary & { cashCount: number; bankTransferCount: number }
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
}
