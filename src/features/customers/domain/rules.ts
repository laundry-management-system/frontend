import type { CustomerFormValues, CustomerOrder, OrderStatus } from './types'

export const CUSTOMER_LIMITS = { fullName: 100, address: 255, note: 500 } as const

const PHONE_PATTERN = /^0\d{9}$/

export const normalizePhone = (value: string) => value.replace(/[\s.-]/g, '')

export const looksLikePhone = (value: string) => /^\d+$/.test(normalizePhone(value.trim()))

export function validateCustomerForm(values: CustomerFormValues) {
  const errors: Partial<Record<keyof CustomerFormValues, string>> = {}
  const fullName = values.fullName.trim()
  const phone = normalizePhone(values.phone.trim())

  if (!fullName) errors.fullName = 'Vui lòng nhập họ tên'
  else if (fullName.length > CUSTOMER_LIMITS.fullName) errors.fullName = 'Họ tên tối đa 100 ký tự'

  if (!phone) errors.phone = 'Vui lòng nhập số điện thoại'
  else if (!PHONE_PATTERN.test(phone)) errors.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'

  if (values.address.trim().length > CUSTOMER_LIMITS.address)
    errors.address = 'Địa chỉ tối đa 255 ký tự'
  if (values.note.trim().length > CUSTOMER_LIMITS.note) errors.note = 'Ghi chú tối đa 500 ký tự'

  return errors
}

export const toCustomerPayload = (values: CustomerFormValues) => ({
  fullName: values.fullName.trim(),
  phone: normalizePhone(values.phone.trim()),
  address: values.address.trim() || null,
  note: values.note.trim() || null,
})

export const isDuplicatePhoneError = (err: { status: number; message: string }) =>
  err.status === 400 && /already registered/i.test(err.message)

export const isOpenOrder = (status: OrderStatus) => status !== 'DELIVERED' && status !== 'CANCELLED'

export function summarizeOrders(orders: CustomerOrder[]) {
  let totalSpent = 0
  const counts = new Map<string, number>()
  for (const order of orders) {
    if (order.paymentStatus === 'PAID' && order.status !== 'CANCELLED')
      totalSpent += order.totalAmount
    if (order.serviceName) counts.set(order.serviceName, (counts.get(order.serviceName) ?? 0) + 1)
  }
  let topService: string | null = null
  let best = 0
  for (const [name, count] of counts) {
    if (count > best) {
      topService = name
      best = count
    }
  }
  return { totalSpent, topService }
}

export const formatPhone = (phone: string) =>
  /^\d{10}$/.test(phone) ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` : phone
