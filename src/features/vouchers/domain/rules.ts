import type { Voucher, VoucherDisplayStatus } from './types'

export const VOUCHER_CODE_MAX = 20
export const VOUCHER_CODE_PATTERN = /^[A-Za-z0-9_-]+$/

export type VoucherReason =
  'NOT_FOUND' | 'DISABLED' | 'NOT_STARTED' | 'EXPIRED' | 'USED_UP' | 'BELOW_MIN'

export type VoucherCheck = { ok: true; discount: number } | { ok: false; reason: VoucherReason }

export const VOUCHER_REASON_LABEL: Record<VoucherReason, string> = {
  NOT_FOUND: 'Mã voucher không tồn tại',
  DISABLED: 'Voucher đã bị tắt',
  NOT_STARTED: 'Voucher chưa đến ngày áp dụng',
  EXPIRED: 'Voucher đã hết hạn',
  USED_UP: 'Voucher đã hết lượt sử dụng',
  BELOW_MIN: 'Đơn chưa đạt giá trị tối thiểu của voucher',
}

const money = (n: number) => `${n.toLocaleString('vi-VN')}đ`

export const formatDiscount = (v: Pick<Voucher, 'discountType' | 'discountValue'>) =>
  v.discountType === 'PERCENT'
    ? `${v.discountValue.toLocaleString('vi-VN')}%`
    : money(v.discountValue)

/** BR-G01–G05, cùng thứ tự kiểm tra với BE. `today` dạng YYYY-MM-DD; ngày hiệu lực tính cả hai đầu. */
export function checkVoucher(
  v: Voucher | null | undefined,
  subtotal: number,
  today: string,
): VoucherCheck {
  if (!v) return { ok: false, reason: 'NOT_FOUND' }
  if (v.status === 'DISABLED') return { ok: false, reason: 'DISABLED' }
  if (today < v.startDate) return { ok: false, reason: 'NOT_STARTED' }
  if (today > v.endDate) return { ok: false, reason: 'EXPIRED' }
  if (v.usedCount >= v.maxUses) return { ok: false, reason: 'USED_UP' }
  if (subtotal < v.minOrderValue) return { ok: false, reason: 'BELOW_MIN' }
  const raw =
    v.discountType === 'PERCENT' ? Math.round((subtotal * v.discountValue) / 100) : v.discountValue
  return { ok: true, discount: Math.min(raw, subtotal) }
}

export const voucherReasonText = (reason: VoucherReason, v: Voucher | null | undefined) =>
  reason === 'BELOW_MIN' && v
    ? `Đơn chưa đạt giá trị tối thiểu ${money(v.minOrderValue)}`
    : VOUCHER_REASON_LABEL[reason]

export function voucherDisplayStatus(v: Voucher, today: string): VoucherDisplayStatus {
  if (v.status === 'DISABLED') return 'disabled'
  if (today < v.startDate) return 'notStarted'
  if (today > v.endDate) return 'expired'
  if (v.usedCount >= v.maxUses) return 'exhausted'
  return 'active'
}

const dmy = (d: string) => d.split('-').reverse()

/** "01/09 – 30/09/2026"; khác năm thì ghi đủ năm ở cả hai đầu. */
export function formatValidity(v: Pick<Voucher, 'startDate' | 'endDate'>) {
  const [sd, sm, sy] = dmy(v.startDate)
  const [ed, em, ey] = dmy(v.endDate)
  return `${sd}/${sm}${sy === ey ? '' : `/${sy}`} – ${ed}/${em}/${ey}`
}

type ErrorLike = { status: number; message: string }

/** 403 không có ở đây: queryClient đã báo lỗi quyền chung. */
export function voucherErrorMessage(err: ErrorLike): {
  field?: 'code' | 'maxUses'
  message: string
} {
  if (err.status === 404) return { message: 'Không tìm thấy voucher' }
  if (err.status === 400 && /already exists/i.test(err.message))
    return { field: 'code', message: 'Mã voucher đã tồn tại' }
  if (err.status === 400 && /less than already used count/i.test(err.message))
    return { field: 'maxUses', message: 'Số lần tối đa không được nhỏ hơn số lần đã dùng' }
  if (err.status === 400 && /already (disabled|active)/i.test(err.message))
    return { message: 'Voucher đã ở trạng thái này' }
  return { message: err.message }
}
