import { DENOMINATIONS } from './types.ts'

export type DenominationCounts = Partial<Record<number, number>>

const vnd = new Intl.NumberFormat('vi-VN')
const money = (v: number) => `${vnd.format(v)}đ`

export const denominationTotal = (counts: DenominationCounts) =>
  DENOMINATIONS.reduce((sum, d) => sum + d * (counts[d] ?? 0), 0)

/** Chỉ giữ mệnh giá có đếm (> 0 tờ) để gửi lên; rỗng thì không gửi bảng */
export const countedDenominations = (counts: DenominationCounts): Record<number, number> =>
  Object.fromEntries(
    DENOMINATIONS.filter((d) => (counts[d] ?? 0) > 0).map((d) => [d, counts[d] ?? 0]),
  )

/** Chênh lệch = thực đếm − dự kiến; âm là thiếu, dương là dư */
export const difference = (counted: number, expected: number) => counted - expected

export const handIn = (counted: number, keep: number) => counted - keep

export type DiffTone = 'success' | 'danger' | 'warning'

/** Màu cho chênh lệch: khớp xanh, thiếu đỏ, dư vàng */
export const toneOf = (d: number | null): DiffTone | undefined =>
  d === null ? undefined : d === 0 ? 'success' : d < 0 ? 'danger' : 'warning'

export const differenceLabel = (d: number) =>
  d === 0 ? 'Khớp' : d < 0 ? `Thiếu ${money(-d)}` : `Dư ${money(d)}`

export interface CloseCheckInput {
  counted: number | ''
  expected: number
  bankReconciled: boolean
  differenceReason: string
  keep: number | ''
  onBehalf: boolean
  onBehalfReason: string
  /** Lệch giữa app ngân hàng và hệ thống thì phải ghi lý do */
  transfer?: { bankTotal: number | ''; systemTotal: number; reason: string }
}

/** Điều kiện mở khóa nút Kết ca; `reasons` liệt kê những gì còn thiếu, theo thứ tự trên màn hình */
export function canClose(i: CloseCheckInput): { ok: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (i.counted === '') reasons.push('Đếm tiền mặt theo mệnh giá')
  else if (difference(i.counted, i.expected) !== 0 && !i.differenceReason.trim())
    reasons.push('Ghi lý do chênh lệch')
  if (!i.bankReconciled) reasons.push('Đối chiếu tổng chuyển khoản với ứng dụng ngân hàng')
  else if (i.transfer && i.transfer.bankTotal === '')
    reasons.push('Nhập tổng tiền về trong ứng dụng ngân hàng')
  else if (
    i.transfer &&
    i.transfer.bankTotal !== i.transfer.systemTotal &&
    !i.transfer.reason.trim()
  )
    reasons.push('Ghi lý do lệch chuyển khoản')
  if (i.keep === '') reasons.push('Nhập tiền để lại két')
  else if (i.counted !== '' && i.keep > i.counted)
    reasons.push('Tiền để lại két không được vượt tiền thực đếm')
  if (i.onBehalf && !i.onBehalfReason.trim()) reasons.push('Ghi lý do kết ca thay')
  return { ok: reasons.length === 0, reasons }
}
