/** Tiền là BigDecimal của BE: có thể về dạng số hoặc chuỗi */
type Money = number | string

interface RevenueSummaryDto {
  cash: Money
  bankTransfer: Money
  total: Money
  paymentCount: number
  /** Chỉ có ở báo cáo doanh thu mới; dashboard cũ có thể thiếu */
  cashCount?: number
  bankTransferCount?: number
}

export interface DashboardResponseDto {
  from: string
  to: string
  orders: {
    received: number
    cancelled: number
    delivered: number
    waiting: number
    processing: number
    readyForPickup: number
  }
  revenue: RevenueSummaryDto
  alerts: { lateOrders: number; storedOrders: number; storedAfterDays: number }
  previous: { from: string; to: string; received: number; revenueTotal: Money }
}

export interface RevenueReportResponseDto {
  from: string
  to: string
  granularity: 'DAY' | 'WEEK' | 'MONTH'
  rows: { period: string; cash: Money; bankTransfer: Money; total: Money; paymentCount: number }[]
  summary: RevenueSummaryDto
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
}

export interface OrderReportResponseDto {
  from: string
  to: string
  granularity: 'DAY' | 'MONTH'
  summary: {
    totalOrders: number
    cancelledOrders: number
    activeOrders: number
    lateOrders: number
    lateRatePercent: Money
  }
  byStatus: { status: string; description: string; count: number }[]
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
