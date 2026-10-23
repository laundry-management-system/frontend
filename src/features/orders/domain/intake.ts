import { type OpeningHours, type QuickDueKey, suggestDueAtForHours } from './dueDate.ts'
import type { OrderType } from './types.ts'

/** Thông tin dịch vụ cần để tách đơn; khớp `Service` của features/services. */
export interface IntakeService {
  id: number
  name: string
  standardHours: number
  expressSupported: boolean
  expressHours: number | null
  whitesApplicable: boolean
}

export type DueKey = QuickDueKey | 'custom'

/** Lựa chọn ở quầy. Dịch vụ chỉ là ghi chú tham khảo để tách đơn, không có giá. */
export interface IntakeSelection {
  serviceIds: number[]
  express: boolean
  /** Dịch vụ khách muốn giặt nhanh (luôn là tập con của serviceIds) */
  expressIds: number[]
  whites: Record<OrderType, boolean>
  /** Ngày đã chọn bằng nút nhanh hoặc sửa tay; 'suggest' thì tính lại theo dịch vụ */
  due: Record<OrderType, Date | null>
  dueKey: Record<OrderType, DueKey>
}

export interface PlannedOrder<S extends IntakeService = IntakeService> {
  orderType: OrderType
  services: S[]
  /** Thời gian lớn nhất (chuẩn hoặc nhanh) của các dịch vụ trong đơn */
  hours: number
  suggestedDueAt: Date
  dueAt: Date | null
  whitesAvailable: boolean
  /** Cờ đồ trắng sau khi bỏ tự động khi đơn không còn dịch vụ áp dụng */
  whites: boolean
}

export const PLANNED_ORDER_LABEL: Record<OrderType, string> = {
  NORMAL: 'Đơn tiêu chuẩn',
  EXPRESS: 'Đơn giặt nhanh',
}

export const emptySelection = (): IntakeSelection => ({
  serviceIds: [],
  express: false,
  expressIds: [],
  whites: { NORMAL: false, EXPRESS: false },
  due: { NORMAL: null, EXPRESS: null },
  dueKey: { NORMAL: 'suggest', EXPRESS: 'suggest' },
})

const without = (ids: number[], id: number) => ids.filter((x) => x !== id)

/** Bỏ chọn một dịch vụ thì bỏ luôn ở danh sách giặt nhanh. */
export const toggleService = (sel: IntakeSelection, id: number): IntakeSelection =>
  sel.serviceIds.includes(id)
    ? { ...sel, serviceIds: without(sel.serviceIds, id), expressIds: without(sel.expressIds, id) }
    : { ...sel, serviceIds: [...sel.serviceIds, id] }

/** Chọn một mục giặt nhanh thì tự chọn dịch vụ đó. */
export const toggleExpressService = (sel: IntakeSelection, id: number): IntakeSelection =>
  sel.expressIds.includes(id)
    ? { ...sel, expressIds: without(sel.expressIds, id) }
    : {
        ...sel,
        expressIds: [...sel.expressIds, id],
        serviceIds: sel.serviceIds.includes(id) ? sel.serviceIds : [...sel.serviceIds, id],
      }

/**
 * Tách lượt: dịch vụ chọn nhanh → đơn Giặt nhanh, còn lại → đơn Tiêu chuẩn; nhóm rỗng thì không tạo.
 * `services` là danh sách dịch vụ đang hoạt động, giữ thứ tự hiển thị của nó.
 */
export function planOrders<S extends IntakeService>(
  sel: IntakeSelection,
  services: S[],
  now: Date,
  opening: OpeningHours,
): PlannedOrder<S>[] {
  const expressIds = sel.express ? sel.expressIds : []
  const groups: [OrderType, S[]][] = [
    ['NORMAL', services.filter((s) => sel.serviceIds.includes(s.id) && !expressIds.includes(s.id))],
    ['EXPRESS', services.filter((s) => expressIds.includes(s.id))],
  ]
  return groups
    .filter(([, list]) => list.length > 0)
    .map(([orderType, list]) => {
      const hours = Math.max(
        ...list.map((s) =>
          orderType === 'EXPRESS' ? (s.expressHours ?? s.standardHours) : s.standardHours,
        ),
      )
      const suggestedDueAt = suggestDueAtForHours(now, hours, opening)
      const whitesAvailable = list.some((s) => s.whitesApplicable)
      return {
        orderType,
        services: list,
        hours,
        suggestedDueAt,
        dueAt: sel.dueKey[orderType] === 'suggest' ? suggestedDueAt : sel.due[orderType],
        whitesAvailable,
        whites: whitesAvailable && sel.whites[orderType],
      }
    })
}

interface BlockInput {
  phoneValid: boolean
  customerName: string
  sel: IntakeSelection
  plans: PlannedOrder[]
  now: Date
}

/** Lý do đầu tiên khiến chưa tạo được lượt; `null` khi đủ điều kiện. */
export function intakeBlockReason({ phoneValid, customerName, sel, plans, now }: BlockInput) {
  if (!phoneValid) return 'Nhập số điện thoại 10 số, bắt đầu bằng 0.'
  if (!customerName.trim()) return 'Nhập họ và tên khách.'
  if (!sel.serviceIds.length) return 'Chọn ít nhất một dịch vụ.'
  if (sel.express && !sel.expressIds.length)
    return 'Đã tick Giặt nhanh – chọn dịch vụ giặt nhanh hoặc bỏ tick.'
  const late = plans.find((p) => !p.dueAt || p.dueAt.getTime() <= now.getTime())
  if (late) return `${PLANNED_ORDER_LABEL[late.orderType]}: ngày hẹn trả phải sau thời điểm nhận.`
  return null
}

export const ctaLabel = (orderCount: number) =>
  orderCount > 1
    ? `Tạo ${orderCount} đơn & in ${orderCount * 2} phiếu`
    : 'Tạo đơn & in phiếu (2 liên)'
