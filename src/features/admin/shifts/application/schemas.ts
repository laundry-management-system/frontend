import { z } from 'zod'

// NumberInput của Mantine trả '' khi ô trống
const numberOrBlank = z.union([z.number(), z.literal('')])

/** `suggested` = tiền để lại két của ca trước; null khi chưa từng kết ca nào */
export const openShiftSchema = (suggested: number | null) =>
  z
    .object({
      openingCash: numberOrBlank.refine((v) => v !== '' && v >= 0, 'Vui lòng nhập tiền đầu ca'),
      openingReason: z.string().max(255, 'Lý do tối đa 255 ký tự'),
    })
    .refine(
      (v) => suggested == null || v.openingCash === suggested || v.openingReason.trim() !== '',
      { message: 'Tiền đầu ca khác số gợi ý, vui lòng ghi lý do', path: ['openingReason'] },
    )

export type OpenShiftFormValues = z.input<ReturnType<typeof openShiftSchema>>
