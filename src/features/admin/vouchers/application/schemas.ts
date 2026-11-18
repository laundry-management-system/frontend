import { z } from 'zod'
import type { CreateVoucherRequestDto } from '../data/dto'
import { VOUCHER_CODE_MAX, VOUCHER_CODE_PATTERN } from '../domain/rules'
import type { DiscountType, Voucher } from '../domain/types'

// NumberInput của Mantine trả '' khi ô trống
const numberOrBlank = z.union([z.number(), z.literal('')])

export interface VoucherFormValues {
  code: string
  discountType: DiscountType
  discountValue: number | ''
  /** YYYY-MM-DD */
  startDate: string | null
  endDate: string | null
  minOrderValue: number | ''
  maxUses: number | ''
}

export function voucherFormSchema(mode: 'create' | 'edit', usedCount = 0) {
  return z
    .object({
      code: z.string().trim(),
      discountType: z.enum(['PERCENT', 'AMOUNT']),
      discountValue: numberOrBlank,
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      minOrderValue: numberOrBlank,
      maxUses: numberOrBlank,
    })
    .superRefine((v, ctx) => {
      const issue = (path: keyof VoucherFormValues, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message })

      if (mode === 'create') {
        if (!v.code) issue('code', 'Vui lòng nhập mã voucher')
        else if (v.code.length > VOUCHER_CODE_MAX) issue('code', 'Mã voucher tối đa 20 ký tự')
        else if (!VOUCHER_CODE_PATTERN.test(v.code))
          issue('code', "Mã chỉ gồm chữ, số, '-' hoặc '_'")
      }

      if (v.discountValue === '') issue('discountValue', 'Vui lòng nhập giá trị giảm')
      else if (v.discountValue <= 0) issue('discountValue', 'Giá trị giảm phải lớn hơn 0')
      else if (v.discountType === 'PERCENT' && v.discountValue > 100)
        issue('discountValue', 'Giảm theo % tối đa 100%')

      if (!v.startDate) issue('startDate', 'Vui lòng chọn ngày bắt đầu')
      if (!v.endDate) issue('endDate', 'Vui lòng chọn ngày kết thúc')
      // Ngày dạng YYYY-MM-DD nên so chuỗi là đúng thứ tự
      else if (v.startDate && v.endDate < v.startDate)
        issue('endDate', 'Ngày kết thúc phải từ ngày bắt đầu trở đi')

      if (v.minOrderValue !== '' && v.minOrderValue < 0)
        issue('minOrderValue', 'Đơn tối thiểu không được âm')

      if (v.maxUses === '') issue('maxUses', 'Vui lòng nhập số lần dùng tối đa')
      else if (!Number.isInteger(v.maxUses) || v.maxUses < 1)
        issue('maxUses', 'Số lần dùng tối đa ít nhất là 1')
      else if (v.maxUses < usedCount)
        issue('maxUses', `Không được nhỏ hơn số lần đã dùng (${usedCount})`)
    })
}

export const toVoucherFormValues = (v: Voucher | null, today: string): VoucherFormValues =>
  v
    ? {
        code: v.code,
        discountType: v.discountType,
        discountValue: v.discountValue,
        startDate: v.startDate,
        endDate: v.endDate,
        minOrderValue: v.minOrderValue,
        maxUses: v.maxUses,
      }
    : {
        code: '',
        discountType: 'PERCENT',
        discountValue: '',
        startDate: today,
        endDate: null,
        minOrderValue: 0,
        maxUses: '',
      }

/** Gọi sau khi form đã qua validate */
export const toVoucherRequest = (v: VoucherFormValues): CreateVoucherRequestDto => ({
  code: v.code.trim().toUpperCase(),
  discountType: v.discountType,
  discountValue: Number(v.discountValue),
  startDate: v.startDate!,
  endDate: v.endDate!,
  minOrderValue: Number(v.minOrderValue) || 0,
  maxUses: Number(v.maxUses),
})
