import type {
  IncidentDetail,
  IncidentStats,
  IncidentStatus,
  IncidentSummary,
} from '../domain/types'
import type {
  IncidentDetailDto,
  IncidentStatsDto,
  IncidentStatusDto,
  IncidentSummaryDto,
} from './dto'

const num = (v: number | string | null | undefined) => Number(v ?? 0)
const numOrNull = (v: number | string | null | undefined) => (v == null ? null : Number(v))

export const toIncidentStatus = (s: IncidentStatusDto) => s.toLowerCase() as IncidentStatus
export const toStatusDto = (s: IncidentStatus) => s.toUpperCase() as IncidentStatusDto

export const toIncidentSummary = (dto: IncidentSummaryDto): IncidentSummary => ({
  id: dto.id,
  code: dto.code,
  orderId: dto.orderId,
  orderCode: dto.orderCode,
  customerName: dto.customerName,
  customerPhone: dto.customerPhone,
  type: dto.type,
  resolution: dto.resolution,
  amount: num(dto.amount),
  status: toIncidentStatus(dto.status),
  deductedAmount: num(dto.deductedAmount),
  payoutDue: num(dto.payoutDue),
  paidAt: dto.paidAt,
  payoutMethod: dto.payoutMethod,
  createdBy: dto.createdBy,
  createdAt: dto.createdAt,
  reviewedBy: dto.reviewedBy,
  reviewedAt: dto.reviewedAt,
})

export const toIncidentDetail = (dto: IncidentDetailDto): IncidentDetail => ({
  ...toIncidentSummary(dto),
  orderItemId: dto.orderItemId,
  itemLabel: dto.itemLabel,
  itemUnit: dto.itemUnit,
  itemQuantity: numOrNull(dto.itemQuantity),
  unitPrice: numOrNull(dto.unitPrice),
  lineTotal: numOrNull(dto.lineTotal),
  affectedCount: dto.affectedCount,
  maxCompensation: num(dto.maxCompensation),
  compensationMultiplier: dto.compensationMultiplier,
  compensationCap: num(dto.compensationCap),
  description: dto.description,
  reviewNote: dto.reviewNote,
  overLimitReason: dto.overLimitReason,
  paidBy: dto.paidBy,
  payoutAmount: numOrNull(dto.payoutAmount),
  payoutShiftId: dto.payoutShiftId,
  payoutShiftCode: dto.payoutShiftCode,
  order: {
    status: dto.order.status,
    paymentStatus: dto.order.paymentStatus,
    subtotal: num(dto.order.subtotal),
    discountAmount: num(dto.order.discountAmount),
    incidentDiscount: num(dto.order.incidentDiscount),
    totalAmount: num(dto.order.totalAmount),
  },
  items: dto.items.map((i) => ({
    id: i.id,
    itemType: i.itemType,
    unit: i.unit,
    quantity: num(i.quantity),
    unitPrice: num(i.unitPrice),
    lineTotal: num(i.lineTotal),
  })),
  initialImages: dto.initialImages,
  initialNote: dto.initialNote,
  images: dto.images,
})

export const toIncidentStats = (dto: IncidentStatsDto): IncidentStats => ({
  pending: dto.pending,
  approved: dto.approved,
  rejected: dto.rejected,
  all: dto.all,
})
