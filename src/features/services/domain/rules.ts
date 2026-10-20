import { UNIT_LABEL, type Service, type ServiceFormValues } from './types.ts'

export const SERVICE_NAME_MAX = 100

// domain không import shared: tự định dạng tiền theo DS (185.000đ)
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`

const unitLabel = (unit: Service['unit']) => (unit ? UNIT_LABEL[unit] : 'đơn vị')

/** Cột "Giặt nhanh": "Có · +12.500đ/kg · 6 giờ" hoặc "Không". */
export function expressLabel(
  s: Pick<Service, 'expressSupported' | 'expressSurcharge' | 'expressHours' | 'unit'>,
) {
  if (!s.expressSupported) return 'Không'
  return `Có · +${money(s.expressSurcharge ?? 0)}/${unitLabel(s.unit)} · ${s.expressHours ?? '—'} giờ`
}

const isInt = (v: number | '') => v !== '' && Number.isInteger(Number(v))

export function validateServiceForm(values: ServiceFormValues) {
  const errors: Partial<Record<keyof ServiceFormValues, string>> = {}
  const name = values.name.trim()

  if (!name) errors.name = 'Vui lòng nhập tên dịch vụ'
  else if (name.length > SERVICE_NAME_MAX) errors.name = 'Tên dịch vụ tối đa 100 ký tự'

  if (!values.unit) errors.unit = 'Vui lòng chọn đơn vị tính'

  if (values.price === '') errors.price = 'Vui lòng nhập đơn giá'
  else if (Number(values.price) < 0 || !isInt(values.price)) errors.price = 'Đơn giá không được âm'

  if (values.standardHours === '') errors.standardHours = 'Vui lòng nhập thời gian xử lý chuẩn'
  else if (!isInt(values.standardHours) || Number(values.standardHours) < 1)
    errors.standardHours = 'Thời gian phải lớn hơn 0 giờ'

  if (values.expressSupported) {
    if (values.expressSurcharge === '') errors.expressSurcharge = 'Vui lòng nhập phụ phí giặt nhanh'
    else if (Number(values.expressSurcharge) < 0) errors.expressSurcharge = 'Phụ phí không được âm'

    if (values.expressHours === '') errors.expressHours = 'Vui lòng nhập thời gian giặt nhanh'
    else if (!isInt(values.expressHours) || Number(values.expressHours) < 1)
      errors.expressHours = 'Thời gian phải lớn hơn 0 giờ'
    // BR-C06
    else if (
      values.standardHours !== '' &&
      Number(values.expressHours) >= Number(values.standardHours)
    )
      errors.expressHours = 'Thời gian giặt nhanh phải ngắn hơn thời gian chuẩn'
  }

  return errors
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
})

export const toFormValues = (s?: Service): ServiceFormValues => ({
  name: s?.name ?? '',
  unit: s?.unit ?? null,
  price: s?.price ?? '',
  standardHours: s?.standardHours ?? '',
  expressSupported: s?.expressSupported ?? false,
  expressSurcharge: s?.expressSurcharge ?? '',
  expressHours: s?.expressHours ?? '',
  status: s?.status ?? 'ACTIVE',
})

export const isPriceChanged = (initial: Service | undefined, values: ServiceFormValues) =>
  !!initial && values.price !== '' && Number(values.price) !== initial.price
