import dayjs from 'dayjs'
import { checkVoucher } from '../domain/rules'
import { useVoucherByCode } from './useVoucherByCode'

/** Kiểm tra mã đang áp với tiền hàng hiện tại; dùng chung cache nên gọi ở nhiều nơi không tạo thêm request. */
export function useAppliedVoucher(code: string | null, subtotal: number) {
  const query = useVoucherByCode(code)
  // Chưa tải xong (mở lại bản nháp) thì chưa kiểm tra, tránh hiện giảm giá sai
  const check =
    code && query.isSuccess
      ? checkVoucher(query.data, subtotal, dayjs().format('YYYY-MM-DD'))
      : null
  return {
    voucher: query.data ?? null,
    check,
    failed: !!code && query.isError,
    discount: check?.ok ? check.discount : 0,
  }
}
