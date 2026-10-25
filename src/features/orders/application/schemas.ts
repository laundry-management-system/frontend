import { z } from 'zod'
import { validateDueAt } from '../domain/dueDate.ts'

const PHONE_PATTERN = /^0\d{9}$/
export const stripPhone = (value: string) => value.replace(/[\s.-]/g, '')

export interface IntakeFormValues {
  phone: string
  customerName: string
}

/** Chỉ khối Khách hàng; dịch vụ / giặt nhanh / ngày hẹn kiểm bằng `intakeBlockReason` (domain/intake). */
export const intakeFormSchema = z.object({
  phone: z
    .string()
    .transform(stripPhone)
    .refine((v) => v !== '', { message: 'Vui lòng nhập số điện thoại', abort: true })
    .refine((v) => PHONE_PATTERN.test(v), 'Số điện thoại gồm 10 số, bắt đầu bằng 0'),
  customerName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ tên')
    .max(100, 'Họ tên tối đa 100 ký tự'),
})

/** Cột `shelf_location` tối đa 20 ký tự. */
export const completeOrderSchema = z.object({
  shelfLocation: z.string().trim().min(1, 'Vui lòng nhập vị trí kệ').max(20, 'Tối đa 20 ký tự'),
  channel: z.enum(['ZALO', 'SMS']),
})

export type CompleteOrderValues = z.input<typeof completeOrderSchema>

const reasonField = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập lý do')
  .max(500, 'Lý do tối đa 500 ký tự')

export const cancelOrderSchema = (paid: boolean) =>
  z.object({ reason: reasonField, refunded: z.boolean() }).refine((v) => !paid || v.refunded, {
    path: ['refunded'],
    message: 'Xác nhận đã hoàn tiền cho khách',
  })

export interface CancelOrderValues {
  reason: string
  refunded: boolean
}

export type AdminMode = 'revert' | 'reschedule' | 'price'

export interface AdminReasonValues {
  mode: AdminMode
  targetStatus: string | null
  dueAt: Date | null
  newTotalAmount: number | ''
  reason: string
}

export const adminReasonSchema = z
  .object({
    mode: z.enum(['revert', 'reschedule', 'price']),
    targetStatus: z.string().nullable(),
    dueAt: z.date().nullable(),
    newTotalAmount: z.union([z.number(), z.literal('')]),
    reason: reasonField,
  })
  .superRefine((v, ctx) => {
    const issue = (path: 'targetStatus' | 'dueAt' | 'newTotalAmount', message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if (v.mode === 'revert' && !v.targetStatus)
      issue('targetStatus', 'Không có bước trước để lùi về')
    if (v.mode === 'reschedule') {
      const message = validateDueAt(v.dueAt, new Date())
      if (message) issue('dueAt', message)
    }
    if (v.mode === 'price') {
      if (v.newTotalAmount === '') issue('newTotalAmount', 'Vui lòng nhập tổng tiền mới')
      else if (!Number.isInteger(v.newTotalAmount) || v.newTotalAmount < 0)
        issue('newTotalAmount', 'Tổng tiền phải là số nguyên không âm')
    }
  })

export const transferConfirmSchema = z.object({
  referenceCode: z.string().trim().max(50, 'Mã tham chiếu tối đa 50 ký tự'),
})

export type TransferConfirmValues = z.input<typeof transferConfirmSchema>

export const discrepancySchema = (expected: number) =>
  z.object({
    receivedAmount: z
      .union([z.number(), z.literal('')])
      .refine((v) => v !== '', { message: 'Nhập số tiền đã nhận', abort: true })
      .refine((v) => Number(v) > 0, { message: 'Số tiền phải lớn hơn 0', abort: true })
      .refine((v) => v !== expected, 'Không có chênh lệch'),
    note: z.string().trim().min(1, 'Nhập ghi chú chênh lệch').max(500, 'Ghi chú tối đa 500 ký tự'),
  })

export interface DiscrepancyValues {
  receivedAmount: number | ''
  note: string
}

export const resolutionSchema = z.object({
  resolution: z.enum(['VOIDED', 'REFUNDED']),
  reason: z.string().trim().min(1, 'Nhập lý do').max(255, 'Lý do tối đa 255 ký tự'),
})

export type ResolutionValues = z.input<typeof resolutionSchema>

/** Nhận hộ thì tên và quan hệ phải đi cùng nhau. */
export const deliverySchema = z
  .object({
    mode: z.enum(['SELF', 'PROXY']),
    receiverName: z.string().trim().max(100, 'Tối đa 100 ký tự'),
    receiverRelation: z.string().trim().max(50, 'Tối đa 50 ký tự'),
  })
  .superRefine((v, ctx) => {
    if (v.mode !== 'PROXY') return
    if (!v.receiverName)
      ctx.addIssue({ code: 'custom', path: ['receiverName'], message: 'Nhập họ tên người nhận' })
    if (!v.receiverRelation)
      ctx.addIssue({
        code: 'custom',
        path: ['receiverRelation'],
        message: 'Nhập quan hệ với khách',
      })
  })

export type DeliveryValues = z.input<typeof deliverySchema>
