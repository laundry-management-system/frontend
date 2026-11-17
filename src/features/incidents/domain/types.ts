export type IncidentType = 'LOST' | 'TORN' | 'FADED' | 'SHRUNK' | 'OTHER'
export type IncidentResolution = 'REWASH' | 'DISCOUNT' | 'COMPENSATION'
/** Khớp nhóm `incident` trong domainStatuses */
export type IncidentStatus = 'pending' | 'approved' | 'rejected'
export type PayoutMethod = 'CASH' | 'BANK_TRANSFER'
export type IncidentUnit = 'KG' | 'PIECE' | 'SET' | 'PRODUCT'
export type IncidentOrderStatus =
  'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'

export const INCIDENT_TYPE_LABEL: Record<IncidentType, string> = {
  LOST: 'Mất',
  TORN: 'Rách',
  FADED: 'Phai màu',
  SHRUNK: 'Co rút',
  OTHER: 'Khác',
}

export const RESOLUTION_LABEL: Record<IncidentResolution, string> = {
  REWASH: 'Giặt lại',
  DISCOUNT: 'Giảm giá',
  COMPENSATION: 'Bồi thường',
}

export const PAYOUT_METHOD_LABEL: Record<PayoutMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
}

export const INCIDENT_UNIT_LABEL: Record<IncidentUnit, string> = {
  KG: 'kg',
  PIECE: 'món',
  SET: 'bộ',
  PRODUCT: 'sản phẩm',
}

export interface IncidentSummary {
  id: number
  code: string
  orderId: number
  orderCode: string
  customerName: string
  customerPhone: string
  type: IncidentType
  resolution: IncidentResolution | null
  amount: number
  status: IncidentStatus
  deductedAmount: number
  payoutDue: number
  paidAt: string | null
  payoutMethod: PayoutMethod | null
  createdBy: string
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
}

export interface IncidentItemOption {
  id: number
  itemType: string
  unit: IncidentUnit
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface IncidentImage {
  id: number
  imageUrl: string
  note?: string | null
}

export interface IncidentOrderBlock {
  status: IncidentOrderStatus
  paymentStatus: 'UNPAID' | 'PAID'
  subtotal: number
  discountAmount: number
  incidentDiscount: number
  totalAmount: number
}

export interface IncidentDetail extends IncidentSummary {
  orderItemId: number | null
  itemLabel: string | null
  itemUnit: IncidentUnit | null
  itemQuantity: number | null
  unitPrice: number | null
  lineTotal: number | null
  affectedCount: number
  maxCompensation: number
  compensationMultiplier: number
  compensationCap: number
  description: string
  reviewNote: string | null
  overLimitReason: string | null
  paidBy: string | null
  payoutAmount: number | null
  payoutShiftId: number | null
  payoutShiftCode: string | null
  order: IncidentOrderBlock
  items: IncidentItemOption[]
  initialImages: IncidentImage[]
  initialNote: string | null
  images: IncidentImage[]
}

export interface IncidentStats {
  pending: number
  approved: number
  rejected: number
  all: number
  paidCash: number
  paidTransfer: number
}

export interface IncidentFormValues {
  orderItemId: string | null
  affectedCount: number | ''
  type: IncidentType | null
  description: string
  resolution: IncidentResolution | null
  amount: number | ''
  images: IncidentImage[]
}

/** Đầu vào tính tiền: dòng đồ + điều khoản của đơn */
export interface CompensationContext {
  items: IncidentItemOption[]
  compensationMultiplier: number
  compensationCap: number
}
