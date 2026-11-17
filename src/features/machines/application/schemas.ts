import dayjs from 'dayjs'
import { z } from 'zod'
import { duplicateSerialIndexes, MACHINE_LIMITS, MAX_BATCH_QUANTITY } from '../domain/rules'

// NumberInput của Mantine trả '' khi ô trống
const numberOrBlank = z.union([z.number(), z.literal('')])

export const machineFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên máy')
      .max(MACHINE_LIMITS.name, 'Tên máy tối đa 50 ký tự'),
    type: z.enum(['WASHER', 'DRYER']),
    capacityKg: numberOrBlank
      .refine((v) => v !== '', { message: 'Vui lòng nhập công suất', abort: true })
      .refine((v) => Number(v) >= 0.1, 'Công suất phải lớn hơn 0 kg')
      .refine((v) => Number(v) <= MACHINE_LIMITS.capacityMax, 'Công suất tối đa 9.999,9 kg'),
    note: z.string().max(MACHINE_LIMITS.note, 'Ghi chú tối đa 255 ký tự'),
    brand: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập hãng máy')
      .max(MACHINE_LIMITS.brand, 'Hãng máy tối đa 50 ký tự'),
    model: z.string().max(MACHINE_LIMITS.model, 'Model tối đa 50 ký tự'),
    serialNumber: z.string().max(MACHINE_LIMITS.serial, 'Số serial tối đa 50 ký tự'),
    location: z.string().max(MACHINE_LIMITS.location, 'Vị trí tối đa 100 ký tự'),
    purchaseDate: z.string().nullable(),
    warrantyUntil: z.string().nullable(),
    image: z.object({ id: z.number(), url: z.string() }).nullable(),
    quantity: numberOrBlank
      .refine((v) => v !== '', { message: 'Vui lòng nhập số lượng', abort: true })
      .refine((v) => Number.isInteger(v) && Number(v) >= 1, 'Số lượng tối thiểu là 1')
      .refine((v) => Number(v) <= MAX_BATCH_QUANTITY, 'Số lượng tối đa là 20'),
    serialNumbers: z.array(z.string().max(MACHINE_LIMITS.serial, 'Số serial tối đa 50 ký tự')),
  })
  .superRefine((v, ctx) => {
    // Ngày dạng YYYY-MM-DD nên so chuỗi là đúng thứ tự
    if (v.purchaseDate && v.purchaseDate > dayjs().format('YYYY-MM-DD'))
      ctx.addIssue({
        code: 'custom',
        path: ['purchaseDate'],
        message: 'Ngày mua không được ở tương lai',
      })
    if (v.purchaseDate && v.warrantyUntil && v.warrantyUntil < v.purchaseDate)
      ctx.addIssue({
        code: 'custom',
        path: ['warrantyUntil'],
        message: 'Ngày hết bảo hành phải sau ngày mua',
      })
    if (Number(v.quantity) > 1)
      for (const i of duplicateSerialIndexes(v.serialNumbers))
        ctx.addIssue({
          code: 'custom',
          path: ['serialNumbers', i],
          message: 'Số serial bị trùng trong danh sách',
        })
  })
