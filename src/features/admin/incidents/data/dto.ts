import type {
  IncidentOrderStatus,
  IncidentResolution,
  IncidentType,
  IncidentUnit,
  PayoutMethod,
} from '../domain/types'

type Decimal = number | string
export type IncidentStatusDto = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface IncidentSummaryDto {
  id: number
  code: string
  orderId: number
  orderCode: string
  customerName: string
  customerPhone: string
  type: IncidentType
  resolution: IncidentResolution | null
  amount: Decimal
  status: IncidentStatusDto
  deductedAmount: Decimal
  payoutDue: Decimal
  paidAt: string | null
  payoutMethod: PayoutMethod | null
  createdBy: string
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
}

export interface IncidentDetailDto extends IncidentSummaryDto {
  orderItemId: number | null
  itemLabel: string | null
  itemUnit: IncidentUnit | null
  itemQuantity: Decimal | null
  unitPrice: Decimal | null
  lineTotal: Decimal | null
  affectedCount: number
  maxCompensation: Decimal
  compensationMultiplier: number
  compensationCap: Decimal
  description: string
  reviewNote: string | null
  overLimitReason: string | null
  paidBy: string | null
  payoutAmount: Decimal | null
  payoutShiftId: number | null
  payoutShiftCode: string | null
  order: {
    status: IncidentOrderStatus
    paymentStatus: 'UNPAID' | 'PAID'
    subtotal: Decimal
    discountAmount: Decimal | null
    incidentDiscount: Decimal | null
    totalAmount: Decimal
  }
  items: {
    id: number
    itemType: string
    unit: IncidentUnit
    quantity: Decimal
    unitPrice: Decimal
    lineTotal: Decimal
  }[]
  initialImages: { id: number; imageUrl: string; note: string | null }[]
  initialNote: string | null
  images: { id: number; imageUrl: string }[]
}

export interface IncidentStatsDto {
  pending: number
  approved: number
  rejected: number
  all: number
}

export interface SaveIncidentRequestDto {
  orderId?: number
  orderItemId: number | null
  affectedCount: number
  type: IncidentType
  description: string
  resolution: IncidentResolution
  amount: number
  imageIds: number[]
}

export interface ApproveIncidentRequestDto {
  resolution: IncidentResolution
  amount: number
  note: string | null
  overLimitReason: string | null
}
