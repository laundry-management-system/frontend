import { formatConditionNote, type OrderDetail } from '@/features/orders'
import type {
  CompensationContext,
  IncidentImage,
  IncidentItemOption,
  IncidentOrderBlock,
  IncidentOrderStatus,
} from '../../domain/types'

/** Đơn của phiếu, gom từ chi tiết đơn để lập / sửa phiếu (dòng đồ, ảnh lúc nhận, điều khoản đã chốt). */
export interface IncidentOrderView {
  orderId: number
  orderCode: string
  customerName: string
  customerPhone: string
  order: IncidentOrderBlock
  ctx: CompensationContext
  initialOf: (orderItemId: string | null) => { images: IncidentImage[]; note: string | null }
}

export function toOrderView(o: OrderDetail): IncidentOrderView {
  const lines = o.items.filter((l) => l.id != null)
  const items: IncidentItemOption[] = lines.map((l) => {
    const quantity = l.billableQuantity ?? Number(l.quantity || 0)
    return {
      id: l.id!,
      itemType: l.itemType,
      unit: l.unit,
      quantity: Number(l.quantity || 0),
      unitPrice: l.unitPrice,
      lineTotal: Math.round(l.unitPrice * quantity),
    }
  })
  return {
    orderId: o.id,
    orderCode: o.orderCode,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    order: {
      status: o.status as IncidentOrderStatus,
      paymentStatus: o.paymentStatus,
      subtotal: o.subtotal,
      discountAmount: o.discountAmount,
      incidentDiscount: o.incidentDiscount,
      totalAmount: o.totalAmount,
    },
    ctx: {
      items,
      compensationMultiplier: o.compensationMultiplier,
      compensationCap: o.compensationCap,
    },
    initialOf: (orderItemId) => {
      const line = lines.find((l) => String(l.id) === orderItemId)
      if (!line) return { images: lines.flatMap((l) => l.images ?? []), note: null }
      return {
        images: line.images ?? [],
        note: formatConditionNote(line.conditionTags, line.conditionText),
      }
    },
  }
}
