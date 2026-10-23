import { z } from 'zod'

// NumberInput của Mantine trả '' khi ô trống
export const whitesFeeFormSchema = z.object({
  whitesFee: z
    .union([z.number(), z.literal('')])
    .refine((v) => v !== '', { message: 'Vui lòng nhập phụ phí', abort: true })
    .refine((v) => Number.isInteger(v) && Number(v) >= 0, 'Phụ phí phải là số nguyên không âm'),
})

export type WhitesFeeFormValues = z.input<typeof whitesFeeFormSchema>
