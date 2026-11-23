import type {
  EstimateInput,
  EstimateResult,
  Pick,
  PublicService,
  PublicServiceArea,
  PublicServiceUnit,
} from './types.ts'

const MAX_QUANTITY = 1000
const NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/

export const QUANTITY_ERRORS = {
  notNumber: 'Vui lòng nhập số lượng là một số',
  notPositive: 'Số lượng phải lớn hơn 0',
  badPrecision: 'Số lượng không hợp lệ: món phải là số nguyên, kg tối đa 2 chữ số thập phân',
  tooLarge: 'Số lượng tối đa là 1.000',
} as const

/** Khách có thể gõ dấu phẩy hoặc chấm làm dấu thập phân. */
const normalize = (raw: string) => raw.trim().replace(',', '.')

/** Lỗi đầu tiên theo thứ tự: không phải số → ≤ 0 → sai số lẻ → quá 1.000; hợp lệ trả `null`. */
export function validateQuantity(raw: string, unit: PublicServiceUnit): string | null {
  const text = normalize(raw)
  if (!NUMBER_PATTERN.test(text)) return QUANTITY_ERRORS.notNumber
  const value = Number(text)
  if (value <= 0) return QUANTITY_ERRORS.notPositive
  const decimals = (text.split('.')[1] ?? '').replace(/0+$/, '').length
  if (unit === 'KG' ? decimals > 2 : decimals > 0) return QUANTITY_ERRORS.badPrecision
  if (value > MAX_QUANTITY) return QUANTITY_ERRORS.tooLarge
  return null
}

/**
 * Tính theo phần trăm đơn vị (số nguyên) để 2,55 kg × 25.000 không lệch vì float.
 * shortcut: chép lại công thức của computeTotals (orders) thay vì dùng chung, vì domain landing không được
 * import feature orders; khi orders đổi cách tính giá thì phải sửa cả hai nơi.
 */
export function estimate(
  input: EstimateInput,
  service: PublicService,
  area: PublicServiceArea | null,
): EstimateResult | null {
  if (validateQuantity(input.quantity, service.unit) !== null) return null
  const price = priceFor(service, input.washModeId)
  if (price === null) return null
  const qty = Math.round(Number(normalize(input.quantity)) * 100)
  const min = Math.round(service.minQuantity * 100)
  const billable = Math.max(qty, min)
  const subtotal = Math.round((price * billable) / 100)
  const door = input.mode === 'DOOR' && area !== null
  const deliveryFee = door
    ? (input.pickup ? area.pickupFee : 0) + (input.delivery ? area.deliveryFee : 0)
    : 0
  return {
    billableQty: billable / 100,
    belowMinimum: qty < min,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}

/** Đơn giá của dịch vụ theo hình thức giặt; hình thức không áp dụng thì `null`. */
export const priceFor = (service: PublicService, washModeId: number | null) =>
  service.prices.find((p) => p.washModeId === washModeId)?.price ?? null

/** Khớp lại lựa chọn khi danh sách tải lại: cùng vị trí và tên → giữ; không thì vị trí đầu tiên cùng tên; không còn → `null`. */
export function rematch(pick: Pick | null, list: readonly { name: string }[]): Pick | null {
  if (!pick) return null
  if (list[pick.index]?.name === pick.name) return pick
  const index = list.findIndex((x) => x.name === pick.name)
  return index === -1 ? null : { index, name: pick.name }
}
