import { formatMoney } from './format.ts'

/** Câu điều khoản in trên phiếu nhận đồ (BR-I04). */
export const compensationTermsText = (multiplier: number, cap: number) =>
  `Bồi thường tối đa ${multiplier} lần giá dịch vụ của món, không quá ${formatMoney(cap)}/món`
