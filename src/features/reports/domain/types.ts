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

export interface DailyRevenue {
  date: string
  cash: number
  bankTransfer: number
  total: number
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
