import { z } from 'zod'
import { normalizePhone } from '@/features/client/customer-account'
import { appointmentSlots, returnSlots, toAppointmentIso } from '../domain/appointment'
import { gapHoursOf, type BookingStep } from '../domain/draft'
import type {
  BookingArea,
  BookingDraft,
  BookingIntakeResult,
  BookingOrder,
  BookingService,
  BookingSettings,
  BookingStore,
} from '../domain/types'

const money = z.number().int().nonnegative()

export const bookingSettingsSchema = z.object({
  bookingEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
  minLeadHours: z.number().nonnegative(),
  returnGapHoursNormal: z.number().nonnegative(),
  returnGapHoursExpress: z.number().nonnegative(),
}) satisfies z.ZodType<BookingSettings>

const bookingOrderSchema = z.object({
  orderCode: z.string(),
  orderType: z.enum(['NORMAL', 'EXPRESS']),
  status: z.string(),
  createdAt: z.string(),
  appointmentAt: z.string(),
  dueAt: z.string().nullable(),
  contactName: z.string(),
  contactPhone: z.string(),
  dropoffMethod: z.enum(['AT_STORE', 'PICKUP']),
  returnMethod: z.enum(['AT_STORE', 'DELIVERY']),
  pickupAreaName: z.string().nullable(),
  deliveryAreaName: z.string().nullable(),
  pickupAddress: z.string().nullable(),
  deliveryAddress: z.string().nullable(),
  note: z.string().nullable(),
  services: z.array(z.object({ serviceId: z.number(), serviceName: z.string().nullable() })),
  washWhitesSeparately: z.boolean(),
  pickupFee: money,
  deliveryFee: money,
}) satisfies z.ZodType<BookingOrder>

export const bookingIntakeSchema = z.object({
  intakeCode: z.string(),
  created: z.boolean(),
  orders: z.array(bookingOrderSchema).length(1),
}) satisfies z.ZodType<BookingIntakeResult>

export interface StepContext {
  services: readonly BookingService[]
  areas: readonly BookingArea[]
  settings: BookingSettings
  store: BookingStore
  /** epoch ms tại lúc bấm "Tiếp tục". */
  now: number
}

type Issue = (path: (string | number)[], message: string) => void
type StepRule = (d: BookingDraft, ctx: StepContext, issue: Issue) => void

const hhmm = (t: string) => t.slice(0, 5)

const rules: Record<BookingStep, StepRule> = {
  1: (d, { services }, issue) => {
    if (d.items.length === 0) issue(['items'], 'Vui lòng chọn ít nhất một dịch vụ')
    if (d.items.length > 20) issue(['items'], 'Tối đa 20 dịch vụ mỗi yêu cầu')
    if (d.orderType === 'EXPRESS') {
      const svc = services.find((s) => !s.expressSupported && d.items.some((i) => i.serviceId === s.id))
      if (svc) issue(['items'], `Dịch vụ "${svc.name}" không hỗ trợ giặt nhanh`)
    }
  },
  // AT_STORE / AT_STORE luôn hợp lệ.
  2: (d, { areas, settings }, issue) => {
    const pickup = d.dropoffMethod === 'PICKUP'
    const delivery = d.returnMethod === 'DELIVERY'
    if (!pickup && !delivery) return
    if (!settings.deliveryEnabled || areas.length === 0) {
      const message = 'Tiệm đang tạm ngưng lấy và giao tận nơi. Vui lòng chọn Mang đến tiệm và Nhận tại tiệm'
      if (pickup) issue(['dropoffMethod'], message)
      if (delivery) issue(['returnMethod'], message)
      return
    }
    if (pickup && !areas.some((a) => a.id === d.pickupAreaId)) issue(['pickupAreaId'], 'Chọn khu vực lấy đồ')
    if (delivery && !areas.some((a) => a.id === d.deliveryAreaId)) issue(['deliveryAreaId'], 'Chọn khu vực giao đồ')
    const address = (key: 'pickupAddress' | 'deliveryAddress', required: string) => {
      if (!d[key].trim()) issue([key], required)
      else if (d[key].length > 255) issue([key], 'Địa chỉ tối đa 255 ký tự')
    }
    if (pickup) {
      address('pickupAddress', 'Nhập địa chỉ lấy đồ')
    }
    if (delivery) address('deliveryAddress', 'Nhập địa chỉ giao đồ')
  },
  3: (d, { store, settings, now }, issue) => {
    const slot = appointmentSlots(now, store.openingTime, store.closingTime, settings.minLeadHours).find(
      (s) => s.date === d.appointmentDate,
    )
    if (d.appointmentHour === null || !slot?.hours.includes(d.appointmentHour)) {
      issue(
        ['appointmentHour'],
        `Giờ hẹn phải nằm trong giờ mở cửa ${hhmm(store.openingTime)} – ${hhmm(store.closingTime)} và sau thời điểm đặt ít nhất ${settings.minLeadHours} giờ`,
      )
      return
    }
    // Giống BE: giờ gửi sai thì chưa xét giờ nhận lại.
    const dropoffIso = toAppointmentIso(slot.date, d.appointmentHour)
    const checkReturn = (key: 'returnHour', date: string | null, hour: number | null, gap: number) => {
      if (date === null || hour === null) return issue([key], 'Chọn giờ nhận lại')
      const ok = returnSlots(dropoffIso, store.openingTime, store.closingTime, gap).some(
        (s) => s.date === date && s.hours.includes(hour),
      )
      if (!ok) {
        issue(
          [key],
          `Giờ nhận lại phải nằm trong giờ mở cửa ${hhmm(store.openingTime)} – ${hhmm(store.closingTime)}, trong vòng 2 ngày sau ngày gửi và sau giờ gửi ít nhất ${gap} giờ`,
        )
      }
    }
    checkReturn('returnHour', d.returnDate, d.returnHour, gapHoursOf(settings, d.orderType))
  },
  4: (d, _ctx, issue) => {
    const name = d.contactName.trim()
    if (!name) issue(['contactName'], 'Nhập họ và tên')
    else if (name.length > 100) issue(['contactName'], 'Họ tên tối đa 100 ký tự')
    if (normalizePhone(d.contactPhone) === null) issue(['contactPhone'], 'Số điện thoại không hợp lệ (10 chữ số)')
    if (d.note.length > 500) issue(['note'], 'Ghi chú tối đa 500 ký tự')
    if (!d.termsAccepted) issue(['termsAccepted'], 'Cần đồng ý điều khoản để đặt đơn')
  },
  5: () => {},
}

/** Luật của một bước, dùng với `schemaResolver(stepSchema(step, ctx), { sync: true })`; trả mọi lỗi cùng lúc. */
export function stepSchema(step: BookingStep, ctx: StepContext) {
  return z.custom<BookingDraft>().superRefine((d, zctx) =>
    rules[step](d, ctx, (path, message) => zctx.addIssue({ code: 'custom', path, message })),
  )
}
