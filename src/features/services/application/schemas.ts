import { z } from 'zod'
import { SERVICE_NAME_MAX } from '../domain/rules.ts'

// NumberInput của Mantine trả '' khi ô trống
const numberOrBlank = z.union([z.number(), z.literal('')])
const isInt = (v: number | '') => v !== '' && Number.isInteger(v)

export const serviceFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên dịch vụ')
      .max(SERVICE_NAME_MAX, 'Tên dịch vụ tối đa 100 ký tự'),
    unit: z
      .enum(['KG', 'PIECE', 'SET', 'PRODUCT'])
      .nullable()
      .refine((v) => v !== null, 'Vui lòng chọn đơn vị tính'),
    price: numberOrBlank
      .refine((v) => v !== '', { message: 'Vui lòng nhập đơn giá', abort: true })
      .refine((v) => isInt(v) && Number(v) >= 0, 'Đơn giá không được âm'),
    standardHours: numberOrBlank
      .refine((v) => v !== '', { message: 'Vui lòng nhập thời gian xử lý chuẩn', abort: true })
      .refine((v) => isInt(v) && Number(v) >= 1, 'Thời gian phải lớn hơn 0 giờ'),
    minQuantity: numberOrBlank.refine((v) => v === '' || v >= 0, 'Tối thiểu không được âm'),
    whitesApplicable: z.boolean(),
    expressSupported: z.boolean(),
    expressSurcharge: numberOrBlank,
    expressHours: numberOrBlank,
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .superRefine((v, ctx) => {
    // KG cho 2 số lẻ, đơn vị khác chỉ số nguyên (khớp BE)
    if (v.minQuantity !== '' && v.unit && v.unit !== 'KG' && !Number.isInteger(v.minQuantity))
      ctx.addIssue({
        code: 'custom',
        path: ['minQuantity'],
        message: 'Tối thiểu phải là số nguyên',
      })
    if (!v.expressSupported) return
    const issue = (path: 'expressSurcharge' | 'expressHours', message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (v.expressSurcharge === '') issue('expressSurcharge', 'Vui lòng nhập phụ phí giặt nhanh')
    else if (v.expressSurcharge < 0) issue('expressSurcharge', 'Phụ phí không được âm')

    if (v.expressHours === '') issue('expressHours', 'Vui lòng nhập thời gian giặt nhanh')
    else if (!isInt(v.expressHours) || v.expressHours < 1)
      issue('expressHours', 'Thời gian phải lớn hơn 0 giờ')
    // BR-C06 (refine của object chỉ chạy khi các field đã hợp lệ, nên standardHours là số)
    else if (v.expressHours >= v.standardHours)
      issue('expressHours', 'Thời gian giặt nhanh phải ngắn hơn thời gian chuẩn')
  })
