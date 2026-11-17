export type DiscountType = 'PERCENT' | 'AMOUNT'

export type VoucherStatus = 'ACTIVE' | 'DISABLED'

export interface Voucher {
  id: number
  code: string
  discountType: DiscountType
  discountValue: number
  /** YYYY-MM-DD, tính cả hai đầu */
  startDate: string
  endDate: string
  minOrderValue: number
  maxUses: number
  usedCount: number
  status: VoucherStatus
  createdAt: string
}

/** Key của group `voucher` trong `domainStatuses` */
export type VoucherDisplayStatus = 'disabled' | 'notStarted' | 'expired' | 'exhausted' | 'active'
