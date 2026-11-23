/** Giờ mở cửa [open, close), tính theo giờ địa phương. */
export interface OpeningHours {
  open: number
  close: number
}

const HOUR = 3_600_000
const AFTERNOON_HOUR = 17

export function roundUpTo30(d: Date): Date {
  const r = new Date(d)
  const extra = r.getMinutes() % 30 || r.getSeconds() || r.getMilliseconds() ? 1 : 0
  r.setSeconds(0, 0)
  r.setMinutes(Math.floor(r.getMinutes() / 30) * 30 + extra * 30)
  return r
}

/** Trước giờ mở → giờ mở cùng ngày; từ giờ đóng trở đi → giờ mở ngày hôm sau. */
export function clampToOpeningHours(d: Date, hours: OpeningHours): Date {
  const r = new Date(d)
  const minutes = r.getHours() * 60 + r.getMinutes()
  if (minutes < hours.open * 60) {
    r.setHours(hours.open, 0, 0, 0)
  } else if (minutes >= hours.close * 60) {
    r.setDate(r.getDate() + 1)
    r.setHours(hours.open, 0, 0, 0)
  }
  return r
}

const plusHours = (now: Date, h: number, hours: OpeningHours) =>
  clampToOpeningHours(roundUpTo30(new Date(now.getTime() + h * HOUR)), hours)

export const validateDueAt = (dueAt: Date | null, now: Date, minDue?: Date) => {
  if (!dueAt) return 'Vui lòng chọn ngày hẹn trả'
  if (minDue && dueAt.getTime() < minDue.getTime())
    return 'Ngày hẹn trả không được sớm hơn thời gian hoàn thành tối thiểu của hình thức'
  return dueAt.getTime() > now.getTime() ? null : 'Ngày hẹn trả phải sau thời điểm hiện tại'
}

/** Ngày hẹn gợi ý của một đơn: nhận + `h` giờ (thời gian chuẩn / giặt nhanh lớn nhất của đơn). */
export const suggestDueAtForHours = (now: Date, h: number, hours: OpeningHours) =>
  plusHours(now, h, hours)

export type QuickDueKey = 'suggest' | 'afternoon' | 'tonight' | 'tomorrow' | 'plus2'

export interface QuickDueOption {
  key: QuickDueKey
  label: string
  date: Date
}

const atHour = (now: Date, dayOffset: number, h: number) => {
  const d = new Date(now)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(h, 0, 0, 0)
  return d
}

/** Gợi ý = minDue (nhận + `h` giờ); nút nhanh chỉ giữ khi không sớm hơn minDue (FR-014). */
export function quickDueOptions(h: number, now: Date, hours: OpeningHours): QuickDueOption[] {
  const minDue = suggestDueAtForHours(now, h, hours)
  const options: QuickDueOption[] = [
    { key: 'suggest', label: `Gợi ý · ${h} giờ`, date: minDue },
    { key: 'afternoon', label: 'Chiều nay 17:00', date: atHour(now, 0, AFTERNOON_HOUR) },
    { key: 'tonight', label: 'Tối nay 20:00', date: atHour(now, 0, 20) },
    { key: 'tomorrow', label: 'Ngày mai 11:00', date: atHour(now, 1, 11) },
    { key: 'plus2', label: '+2 ngày', date: atHour(now, 2, 11) },
  ]
  return options.filter((o) => o.key === 'suggest' || o.date >= minDue)
}

/** Xem trước hạn trả mới khi đồ về tiệm trễ hẹn — khách mang tới hoặc tiệm đi lấy (FR-039); server mới là nguồn chuẩn. */
export function lateDropoffDueAt(
  order: {
    dueAt: string
    washModeHours: number | null
    fulfillment: { dropoffMethod: string; appointmentAt: string | null } | null
  },
  now: Date,
  hours: OpeningHours,
): Date | null {
  const f = order.fulfillment
  if (!f?.appointmentAt || order.washModeHours == null) return null
  if (now.getTime() <= new Date(f.appointmentAt).getTime()) return null
  const next = suggestDueAtForHours(now, order.washModeHours, hours)
  return next.getTime() > new Date(order.dueAt).getTime() ? next : null
}

/** Hạn trả tối thiểu ở bước xác nhận đồ về tiệm: trễ hẹn → max rule, ngược lại = dueAt hiện tại (FR-039). */
export const dropoffMinDue = (
  order: Parameters<typeof lateDropoffDueAt>[0],
  now: Date,
  hours: OpeningHours,
) => lateDropoffDueAt(order, now, hours) ?? new Date(order.dueAt)

/** Nút chọn hạn trả ở bước xác nhận: "Gợi ý" = minDue, các nút nhanh chỉ giữ khi ≥ minDue. */
export const dropoffDueOptions = (minDue: Date, now: Date, hours: OpeningHours): QuickDueOption[] => [
  { key: 'suggest', label: 'Gợi ý', date: minDue },
  ...quickDueOptions(0, now, hours).filter((o) => o.key !== 'suggest' && o.date >= minDue),
]

/** Giữ gợi ý (= minDue) → gửi null để server tự tính; khác thì gửi giờ đã chọn. */
export const dropoffDueRequest = (dueAt: Date, minDue: Date) =>
  dueAt.getTime() === minDue.getTime() ? null : dueAt.toISOString()

export type DropoffDueState = 'onTime' | 'lateUnchanged' | 'lateMoved'

/** Trạng thái bước xác nhận đồ về tiệm: chỉ `lateMoved` đổi được hạn trả, ca khác giữ nguyên (FR-039). */
export function dropoffDueState(
  order: Parameters<typeof lateDropoffDueAt>[0],
  now: Date,
  hours: OpeningHours,
): { state: DropoffDueState; minDue: Date } {
  const appt = order.fulfillment?.appointmentAt
  const minDue = dropoffMinDue(order, now, hours)
  if (!appt || now.getTime() <= new Date(appt).getTime()) return { state: 'onTime', minDue }
  const moved = minDue.getTime() !== new Date(order.dueAt).getTime()
  return { state: moved ? 'lateMoved' : 'lateUnchanged', minDue }
}
