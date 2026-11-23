import type {
  CurrentShift,
  PaymentMethod,
  ShiftStatus,
  ShiftTransactionType,
} from '../domain/types'

/** Tiền là BigDecimal của BE: có thể về dạng số hoặc chuỗi */
type Money = number | string

export interface CurrentShiftResponseDto {
  current: CurrentShift | null
  previous: { code: string; closedByName: string; closedAt: string; keepCash: Money } | null
}

export interface ShiftDetailDto {
  id: number
  code: string
  status: ShiftStatus
  openedById: number
  openedByName: string
  openedAt: string
  openingCash: Money
  suggestedOpeningCash: Money | null
  openingReason: string | null
  closedById: number | null
  closedByName: string | null
  closedAt: string | null
  closeOnBehalfReason: string | null
  cashIn: Money
  cashInCount: number
  cashOut: Money
  cashOutCount: number
  expectedCash: Money
  transferTotal: Money
  transferCount: number
  countedCash: Money | null
  difference: Money | null
  differenceReason: string | null
  denominations: Record<string, number> | null
  bankReconciled: boolean
  bankTotal: Money | null
  transferDifference: Money | null
  transferDifferenceReason: string | null
  keepCash: Money | null
  keepDenominations: Record<string, number> | null
  handInCash: Money | null
  approvedByName: string | null
  approvedAt: string | null
  approvalNote: string | null
}

export interface ShiftRowDto {
  id: number
  code: string
  status: ShiftStatus
  openedByName: string
  openedAt: string
  closedAt: string | null
  expectedCash: Money | null
  countedCash: Money | null
  difference: Money | null
  transferTotal: Money | null
  transferDifference: Money | null
  overdue: boolean
}

export interface ShiftSummaryDto {
  openShift: {
    id: number
    code: string
    openedByName: string
    openedAt: string
    overdue: boolean
  } | null
  pendingApproval: number
}

export interface ShiftTransactionDto {
  at: string
  orderId: number
  orderCode: string
  type: ShiftTransactionType
  method: PaymentMethod
  amount: Money
  actorName: string
  incidentCode?: string | null
}
