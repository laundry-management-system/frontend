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
    prices: z.array(
      z.object({
        mode: z.any(),
        enabled: z.boolean(),
        price: numberOrBlank,
      }),
    ),
    minQuantity: numberOrBlank.refine((v) => v === '' || v >= 0, 'Tối thiểu không được âm'),
    whitesApplicable: z.boolean(),
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
    if (!v.prices.some((p) => p.enabled))
      ctx.addIssue({
        code: 'custom',
        path: ['prices'],
        message: 'Chọn ít nhất một hình thức giặt và nhập giá',
      })
    v.prices.forEach((p, i) => {
      if (!p.enabled) return
      if (p.price === '')
        ctx.addIssue({ code: 'custom', path: ['prices', i, 'price'], message: 'Vui lòng nhập giá' })
      else if (!isInt(p.price) || p.price < 0)
        ctx.addIssue({
          code: 'custom',
          path: ['prices', i, 'price'],
          message: 'Giá phải là số nguyên không âm',
        })
    })
  })

export const washModeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên hình thức')
    .max(50, 'Tên hình thức tối đa 50 ký tự'),
  completionHours: numberOrBlank
    .refine((v) => v !== '', { message: 'Vui lòng nhập thời gian hoàn thành', abort: true })
    .refine((v) => isInt(v) && Number(v) >= 1 && Number(v) <= 720, 'Thời gian từ 1 đến 720 giờ'),
  active: z.boolean(),
  isDefault: z.boolean(),
  services: z.array(
    z.object({
      serviceId: z.number(),
      price: numberOrBlank
        .refine((v) => v !== '', { message: 'Vui lòng nhập giá', abort: true })
        .refine((v) => isInt(v) && Number(v) >= 0, 'Giá không được âm'),
    }),
  ),
})

export type WashModeFormValues = z.input<typeof washModeFormSchema>
