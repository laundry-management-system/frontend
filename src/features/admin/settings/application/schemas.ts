import { z } from 'zod'

// NumberInput của Mantine trả '' khi ô trống
const fee = (message: string) =>
  z
    .union([z.number(), z.literal('')])
    .refine((v) => v !== '' && Number.isInteger(v) && v >= 0, message)

export const serviceAreaFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên khu vực')
    .max(100, 'Tên khu vực tối đa 100 ký tự'),
  pickupFee: fee('Phí lượt lấy phải là số nguyên không âm'),
  deliveryFee: fee('Phí lượt giao phải là số nguyên không âm'),
})
