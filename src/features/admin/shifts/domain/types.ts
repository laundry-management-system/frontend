export type ShiftStatus = 'OPEN' | 'CLOSED' | 'APPROVED'

export const SHIFT_STATUS_LABEL: Record<ShiftStatus, string> = {
  OPEN: 'Đang mở',
  CLOSED: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
}

export type ShiftTransactionType = 'COLLECT' | 'VOID' | 'REFUND' | 'INCIDENT_PAYOUT'

export const SHIFT_TRANSACTION_LABEL: Record<ShiftTransactionType, string> = {
  COLLECT: 'Thu',
  VOID: 'Hủy xác nhận',
  REFUND: 'Hoàn tiền',
  INCIDENT_PAYOUT: 'Chi bồi thường',
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER'

/** Mệnh giá tiền mặt cho bảng đếm khi kết ca (BM15) */
export const DENOMINATIONS = [
  500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000,
] as const

export interface CurrentShift {
  id: number
  code: string
  status: ShiftStatus
  openedById: number
  openedByName: string
  openedAt: string
  openHours: number
  warnAfterHours: number
  overdue: boolean
}

export interface PreviousShift {
  code: string
  closedByName: string
  closedAt: string
  /** Số gợi ý tiền đầu ca của ca sau */
  keepCash: number
}

export interface CurrentShiftState {
  current: CurrentShift | null
  previous: PreviousShift | null
}

export interface ShiftDetail {
  id: number
  code: string
  status: ShiftStatus
  openedById: number
  openedByName: string
  openedAt: string
  openingCash: number
  suggestedOpeningCash: number | null
  openingReason: string | null
  closedById: number | null
  closedByName: string | null
  closedAt: string | null
  closeOnBehalfReason: string | null
  cashIn: number
  cashInCount: number
  cashOut: number
  cashOutCount: number
  expectedCash: number
  transferTotal: number
  transferCount: number
  countedCash: number | null
  difference: number | null
  differenceReason: string | null
  /** Số tờ theo mệnh giá, null nếu không đếm theo mệnh giá */
  denominations: Record<number, number> | null
  bankReconciled: boolean
  /** Tổng tiền về trong app ngân hàng lúc kết ca */
  bankTotal: number | null
  /** App ngân hàng − hệ thống; khác 0 thì có lý do */
  transferDifference: number | null
  transferDifferenceReason: string | null
  keepCash: number | null
  /** Số tờ để lại két theo mệnh giá */
  keepDenominations: Record<number, number> | null
  handInCash: number | null
  approvedByName: string | null
  approvedAt: string | null
  approvalNote: string | null
}

export interface ShiftRow {
  id: number
  code: string
  status: ShiftStatus
  openedByName: string
  openedAt: string
  closedAt: string | null
  expectedCash: number | null
  countedCash: number | null
  difference: number | null
  transferTotal: number | null
  transferDifference: number | null
  overdue: boolean
}

export interface ShiftSummary {
  openShift: Pick<CurrentShift, 'id' | 'code' | 'openedByName' | 'openedAt' | 'overdue'> | null
  pendingApproval: number
}

export interface ShiftTransaction {
  at: string
  orderId: number
  orderCode: string
  type: ShiftTransactionType
  method: PaymentMethod
  amount: number
  actorName: string
  incidentCode: string | null
}

export interface ShiftListParams {
  from: string
  to: string
  status?: ShiftStatus
  /** 0-based */
  page: number
  size: number
}

export interface OpenShiftInput {
  openingCash: number
  openingReason?: string
}

export interface CloseShiftInput {
  expectedCash: number
  countedCash: number
  denominations?: Record<number, number>
  differenceReason?: string
  bankReconciled: boolean
  bankTotal?: number
  transferDifferenceReason?: string
  keepCash: number
  keepDenominations: Record<number, number>
  closeOnBehalfReason?: string
}
