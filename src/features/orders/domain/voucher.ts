import type { Voucher } from './types'

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

export const describeVoucher = (v: Voucher) =>
  `Giảm ${v.discountType === 'PERCENT' ? `${v.discountValue}%` : money(v.discountValue)}` +
  (v.minOrderValue > 0 ? ` cho đơn từ ${money(v.minOrderValue)}` : '')

/** BR-G01–G05. `today` dạng YYYY-MM-DD; ngày hiệu lực tính cả hai đầu. */
export function checkVoucher(
  v: Voucher | undefined,
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
