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
