import dayjs from 'dayjs'
import { findVoucher } from '../data/voucherMock'
import { checkVoucher } from '../domain/voucher'

/** Tra mã voucher (mock) và kiểm tra với tổng tiền hàng hiện tại. */
export function checkVoucherCode(code: string, subtotal: number) {
  const voucher = findVoucher(code)
  return { voucher, check: checkVoucher(voucher, subtotal, dayjs().format('YYYY-MM-DD')) }
}
