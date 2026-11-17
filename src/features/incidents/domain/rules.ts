import type {
  CompensationContext,
  IncidentItemOption,
  IncidentOrderBlock,
  IncidentResolution,
  IncidentSummary,
  IncidentUnit,
} from './types'
import { INCIDENT_UNIT_LABEL } from './types.ts'

const number = new Intl.NumberFormat('vi-VN')
const money = (v: number) => `${number.format(v)}đ`

export const MAX_INCIDENT_IMAGES = 6

/** Mức tối đa = số món × min(K × giá dịch vụ của món, mức trần mỗi món); dịch vụ theo kg lấy đơn giá 1 kg. */
export const maxCompensation = (affected: number, unitPrice: number, k: number, cap: number) =>
  affected >= 1 ? affected * Math.min(k * unitPrice, cap) : 0

export function affectedCountError(unit: IncidentUnit, itemQuantity: number, n: number | '') {
  if (n === '' || !Number.isInteger(n) || n < 1) return 'Số món bị sự cố phải từ 1 trở lên'
  if (unit !== 'KG' && n > itemQuantity)
    return `Số món bị sự cố từ 1 đến ${number.format(itemQuantity)}`
  return null
}

export const isOverLimit = (resolution: IncidentResolution | null, amount: number, max: number) =>
  resolution === 'COMPENSATION' && amount > max

/** Giặt lại luôn 0; Giảm giá ≤ thành tiền của dòng; Bồi thường ≤ mức tối đa trừ khi Admin duyệt vượt kèm lý do. */
export function amountError(
  resolution: IncidentResolution | null,
  amount: number | '',
  lineTotal: number | null,
  max: number,
  { allowOverLimit = false }: { allowOverLimit?: boolean } = {},
) {
  if (amount === '' || amount < 0 || !Number.isInteger(amount))
    return 'Số tiền phải là số nguyên từ 0 trở lên'
  if (resolution === 'DISCOUNT' && amount > (lineTotal ?? 0))
    return `Giảm giá không vượt quá thành tiền của dòng (${money(lineTotal ?? 0)})`
  if (!allowOverLimit && isOverLimit(resolution, amount, max))
    return `Số tiền bồi thường vượt mức tối đa (${money(max)})`
  return null
}

export const formulaText = (n: number, k: number, unitPrice: number, cap: number) =>
  `= ${n} món × min(${k} × ${money(unitPrice)}, ${money(cap)}). Điều khoản chốt theo đơn: K = ${k}, trần ${money(cap)}/món`

/** Phần trừ vào đơn chưa thanh toán và phần còn phải chi cho khách (đơn đã thanh toán: chi toàn bộ). */
export function previewSettlement(amount: number, order: IncidentOrderBlock) {
  const room =
    order.paymentStatus === 'PAID'
      ? 0
      : Math.max(0, order.subtotal - order.discountAmount - order.incidentDiscount)
  const deducted = Math.min(Math.max(amount, 0), room)
  return { deducted, payoutDue: Math.max(amount, 0) - deducted }
}

export function payoutState(i: Pick<IncidentSummary, 'status' | 'payoutDue' | 'paidAt'>) {
  if (i.status !== 'approved' || i.payoutDue <= 0) return 'none' as const
  return i.paidAt ? ('paid' as const) : ('due' as const)
}

export const lineOptionLabel = (index: number, item: IncidentItemOption) =>
  `Dòng ${index + 1} – ${item.itemType} (${number.format(item.quantity)} ${INCIDENT_UNIT_LABEL[item.unit]})`

export const unitPriceLabel = (unitPrice: number, unit: IncidentUnit) =>
  `${money(unitPrice)} / ${INCIDENT_UNIT_LABEL[unit] === 'kg' ? 'kg' : 'món'}`

/** Giá dịch vụ, mức tối đa và thành tiền của dòng đang chọn; chưa chọn dòng thì null. */
export function compensationOf(
  ctx: CompensationContext,
  orderItemId: string | null,
  affected: number | '',
) {
  const item = ctx.items.find((i) => String(i.id) === orderItemId)
  if (!item) return null
  const n = typeof affected === 'number' && affected >= 1 ? affected : 1
  return {
    item,
    affected: n,
    max: maxCompensation(n, item.unitPrice, ctx.compensationMultiplier, ctx.compensationCap),
  }
}
