import { z } from 'zod'
import { isEmail, normalizePhone } from '../domain/identifier'

const password = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số')
  .regex(/[A-Za-z]/, 'Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số')
  .regex(/\d/, 'Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số')

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

const emailField = z
  .string()
  .trim()
  .max(255, 'Email tối đa 255 ký tự')
  .refine((v) => v === '' || (isEmail(v) && z.email().safeParse(v).success), 'Email không hợp lệ')

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100, 'Họ tên tối đa 100 ký tự'),
    phone: z.string().refine((v) => normalizePhone(v) !== null, 'Số điện thoại không hợp lệ'),
    email: emailField,
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100, 'Họ tên tối đa 100 ký tự'),
  email: emailField,
  address: z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })

export const forgotSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email').pipe(z.email('Email không hợp lệ')),
})

export const resetSchema = z
  .object({ newPassword: password, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })

export type ProfileValues = z.infer<typeof profileSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type ForgotValues = z.infer<typeof forgotSchema>
export type ResetValues = z.infer<typeof resetSchema>

export const paymentQrSchema = z.object({
  orderCode: z.string(),
  amount: z.number(),
  bankId: z.string(),
  accountNo: z.string(),
  accountName: z.string(),
  transferContent: z.string(),
  qrImageUrl: z.string(),
})

const nullableString = z.string().nullable()

export const customerOrderDetailSchema = z.object({
  orderCode: z.string(),
  channel: z.enum(['ONLINE', 'OFFLINE']),
  washModeId: z.number(),
  washModeName: z.string(),
  status: z.enum([
    'PENDING_CONFIRMATION',
    'AWAITING_DROPOFF',
    'RECEIVED',
    'PROCESSING',
    'COMPLETED',
    'DELIVERED',
    'CANCELLED',
  ]),
  paymentStatus: z.enum(['UNPAID', 'PAID']),
  paymentClaimedAt: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  paymentClaimRejectedReason: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  voucherEditable: z.boolean().default(false),
  receiptConfirmable: z.boolean().default(false),
  classified: z.boolean(),
  customerRejectReason: nullableString,
  milestones: z.object({
    placedAt: nullableString,
    receivedAt: nullableString,
    processingAt: nullableString,
    completedAt: nullableString,
    deliveringAt: nullableString,
    deliveredAt: nullableString,
  }),
  dueAt: nullableString,
  fulfillment: z
    .object({
      dropoffMethod: z.enum(['AT_STORE', 'PICKUP']),
      returnMethod: z.enum(['AT_STORE', 'DELIVERY']),
      pickupAreaName: nullableString,
      pickupAddress: nullableString,
      deliveryAreaName: nullableString,
      deliveryAddress: nullableString,
      appointmentAt: nullableString,
      dropoffStatus: z
        .enum(['AWAITING_CUSTOMER_DROPOFF', 'CUSTOMER_DROPPED_OFF', 'AWAITING_PICKUP', 'PICKED_UP'])
        .nullable(),
      returnStatus: z
        .enum([
          'AWAITING_CUSTOMER_COLLECT',
          'CUSTOMER_COLLECTED',
          'AWAITING_DELIVERY',
          'DELIVERING',
          'DELIVERED',
        ])
        .nullable(),
      pickupTrackingCode: nullableString,
      deliveryTrackingCode: nullableString,
      pickupFee: z.number().nullable(),
      deliveryFee: z.number().nullable(),
    })
    .nullable(),
  requestedServices: z.array(z.object({ serviceName: z.string() })),
  washWhitesSeparately: z.boolean(),
  items: z.array(
    z.object({
      serviceName: z.string(),
      unit: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      lineTotal: z.number(),
      extra: z.boolean(),
      conditionTags: z.array(z.string()),
      images: z.array(z.object({ url: z.string() })),
    }),
  ),
  money: z.object({
    subtotal: z.number(),
    expressFee: z.number(),
    whitesFee: z.number(),
    discountAmount: z
      .number()
      .nullable()
      .transform((v) => v ?? 0),
    voucherCode: z.string().nullable(),
    incidentDiscount: z
      .number()
      .nullable()
      .transform((v) => v ?? 0),
    totalAmount: z.number(),
    payableAmount: z.number(),
  }),
})
