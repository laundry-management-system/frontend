import { type QuickDueKey } from './dueDate.ts'

export type DueKey = QuickDueKey | 'custom'

interface BlockInput {
  phoneValid: boolean
  customerName: string
  serviceIds: number[]
  hasMode: boolean
  /** Tên dịch vụ đã chọn nhưng không có giá cho hình thức đang chọn */
  notApplicable: string[]
  dueError: string | null
}

/** Lý do đầu tiên khiến chưa tạo được lượt; `null` khi đủ điều kiện. */
export function intakeBlockReason(b: BlockInput) {
  if (!b.phoneValid) return 'Nhập số điện thoại 10 số, bắt đầu bằng 0.'
  if (!b.customerName.trim()) return 'Nhập họ và tên khách.'
  if (!b.hasMode) return 'Chưa có hình thức giặt đang hoạt động.'
  if (!b.serviceIds.length) return 'Chọn ít nhất một dịch vụ.'
  if (b.notApplicable.length)
    return `${b.notApplicable.join(', ')} không áp dụng cho hình thức này – bỏ chọn hoặc đổi hình thức.`
  return b.dueError
}

/** Dịch vụ đã chọn nhưng không có giá cho hình thức `washModeId` (FR-011). */
export const servicesNotApplicable = <S extends { id: number; prices: { washModeId: number }[] }>(
  services: S[],
  selectedIds: number[],
  washModeId: number,
) =>
  services.filter(
    (s) => selectedIds.includes(s.id) && !s.prices.some((p) => p.washModeId === washModeId),
  )

/** Một lượt nhận = một đơn của hình thức đã chọn (FR-010). `dueAt` rỗng thì server đặt minDue. */
export const toIntakeRequest = (i: {
  requestId: string
  customerPhone: string
  customerName: string
  washModeId: number
  serviceIds: number[]
  washWhitesSeparately: boolean
  dueAt: Date | null
}) => ({
  requestId: i.requestId,
  customerPhone: i.customerPhone,
  customerName: i.customerName,
  washModeId: i.washModeId,
  items: i.serviceIds.map((serviceId) => ({ serviceId })),
  washWhitesSeparately: i.washWhitesSeparately,
  ...(i.dueAt && { dueAt: i.dueAt.toISOString() }),
})
