import { UNIT_LABEL, type Service, type ServiceFormValues } from './types.ts'

export const SERVICE_NAME_MAX = 100

// domain không import shared: tự định dạng tiền theo DS (185.000đ)
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`

const unitLabel = (unit: Service['unit']) => (unit ? UNIT_LABEL[unit] : 'đơn vị')

export function expressParts(
  s: Pick<Service, 'expressSupported' | 'expressSurcharge' | 'expressHours' | 'unit'>,
) {
  if (!s.expressSupported) return null
  return {
    surcharge: `+${money(s.expressSurcharge ?? 0)}/${unitLabel(s.unit)}`,
    hours: `${s.expressHours ?? '—'} giờ`,
  }
}

/** Payload gửi BE; tắt giặt nhanh thì xóa phụ phí và thời gian (BE cũng xóa khi expressSupported=false). */
export const toServicePayload = (values: ServiceFormValues) => ({
  name: values.name.trim(),
  unit: values.unit!,
  currentPrice: Number(values.price),
  standardHours: Number(values.standardHours),
  expressSupported: values.expressSupported,
  expressSurcharge: values.expressSupported ? Number(values.expressSurcharge) : null,
  expressHours: values.expressSupported ? Number(values.expressHours) : null,
  minQuantity: values.minQuantity === '' ? 0 : Number(values.minQuantity),
  whitesApplicable: values.whitesApplicable,
})

export const toFormValues = (s?: Service): ServiceFormValues => ({
  name: s?.name ?? '',
  unit: s?.unit ?? null,
  price: s?.price ?? '',
  standardHours: s?.standardHours ?? '',
  expressSupported: s?.expressSupported ?? false,
  expressSurcharge: s?.expressSurcharge ?? '',
  expressHours: s?.expressHours ?? '',
  minQuantity: s?.minQuantity ?? 0,
  whitesApplicable: s?.whitesApplicable ?? false,
  status: s?.status ?? 'ACTIVE',
})

export const isPriceChanged = (initial: Service | undefined, values: ServiceFormValues) =>
  !!initial && values.price !== '' && Number(values.price) !== initial.price

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
