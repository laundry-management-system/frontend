import {
  type PriceField,
  type Service,
  type ServiceFormValues,
  type ServiceStatus,
  type WashMode,
} from './types.ts'

export const SERVICE_NAME_MAX = 100

// domain không import shared: tự định dạng tiền theo DS (185.000đ)
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`

/** Payload gửi BE; chỉ gửi hình thức đang bật (BE giữ nguyên liên kết tới hình thức đã ngừng). */
export const toServicePayload = (values: ServiceFormValues) => ({
  name: values.name.trim(),
  unit: values.unit!,
  prices: values.prices
    .filter((p) => p.enabled)
    .map((p) => ({ washModeId: p.mode.id, price: Number(p.price) })),
  minQuantity: values.minQuantity === '' ? 0 : Number(values.minQuantity),
  whitesApplicable: values.whitesApplicable,
})

/** `activeModes` theo thứ tự BE trả (FR-034); mỗi hình thức đang hoạt động một dòng, bật nếu dịch vụ đã có giá. */
export const toFormValues = (
  s: Service | undefined,
  activeModes: WashMode[],
): ServiceFormValues => ({
  name: s?.name ?? '',
  unit: s?.unit ?? null,
  prices: activeModes.map((mode) => {
    const price = s ? priceFor(s, mode.id) : null
    return { mode, enabled: price != null, price: price ?? '' }
  }),
  minQuantity: s?.minQuantity ?? 0,
  whitesApplicable: s?.whitesApplicable ?? false,
  status: s?.status ?? 'ACTIVE',
})

/** PUT cần cả giá: gửi lại đúng dữ liệu hiện có, chỉ đổi trạng thái. */
export const toStatusChangeDto = (s: Service, activeModes: WashMode[], status: ServiceStatus) => ({
  ...toServicePayload(toFormValues(s, activeModes)),
  status,
})

export interface TrackedChange {
  field: PriceField
  modeName?: string
  oldValue: string | null
  newValue: string | null
}

const asText = (v: number | string | null) => (v == null ? null : String(v))

/** Các trường sẽ ghi vào lịch sử giá nếu lưu form: giá từng hình thức (tắt = bỏ liên kết) và trạng thái. */
export function trackedChanges(
  initial: Service | undefined,
  values: ServiceFormValues,
): TrackedChange[] {
  if (!initial) return []
  const modeChanges = values.prices
    .map((p) => ({
      modeName: p.mode.name,
      before: priceFor(initial, p.mode.id),
      after: p.enabled ? Number(p.price) : null,
    }))
    .filter((c) => c.before !== null && c.before !== c.after) // giá mới thêm không cần lý do
    .map((c) => ({
      field: 'MODE_PRICE' as const,
      modeName: c.modeName,
      oldValue: asText(c.before),
      newValue: asText(c.after),
    }))
  const status =
    initial.status !== values.status
      ? [{ field: 'STATUS' as const, oldValue: initial.status, newValue: values.status }]
      : []
  return [...modeChanges, ...status]
}

const percentFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })

/** Chênh lệch giá cho hộp xác nhận đổi giá: "+6.000đ · +21,4%" (giá cũ 0 thì bỏ %). */
export function priceDelta(oldPrice: number, newPrice: number) {
  const diff = newPrice - oldPrice
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : ''
  const percent = oldPrice
    ? `${sign}${percentFormat.format(Math.abs((diff / oldPrice) * 100))}%`
    : null
  return {
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
    label: `${sign}${money(Math.abs(diff))}${percent ? ` · ${percent}` : ''}`,
  } as const
}

/** Đặt được = có giá cho hình thức mặc định (giá 0 vẫn hợp lệ). */
export const isBookable = (
  service: Pick<Service, 'prices'>,
  defaultModeId: number | null | undefined,
) => defaultModeId != null && service.prices.some((p) => p.washModeId === defaultModeId)

export const priceFor = (service: Pick<Service, 'prices'>, modeId: number) =>
  service.prices.find((p) => p.washModeId === modeId)?.price ?? null
