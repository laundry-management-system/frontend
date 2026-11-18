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

export const validateDueAt = (dueAt: Date | null, now: Date) => {
  if (!dueAt) return 'Vui lòng chọn ngày hẹn trả'
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

/** Bỏ nút đã qua giờ. */
export function quickDueOptions(
  orderType: 'NORMAL' | 'EXPRESS',
  h: number,
  now: Date,
  hours: OpeningHours,
): QuickDueOption[] {
  const options: QuickDueOption[] = [
    { key: 'suggest', label: `Gợi ý · ${h} giờ`, date: suggestDueAtForHours(now, h, hours) },
    orderType === 'EXPRESS'
      ? { key: 'tonight', label: 'Tối nay 20:00', date: atHour(now, 0, 20) }
      : { key: 'afternoon', label: 'Chiều nay 17:00', date: atHour(now, 0, AFTERNOON_HOUR) },
    { key: 'tomorrow', label: 'Ngày mai 11:00', date: atHour(now, 1, 11) },
  ]
  if (orderType === 'NORMAL')
    options.push({ key: 'plus2', label: '+2 ngày', date: atHour(now, 2, 11) })
  return options.filter((o) => o.key === 'suggest' || o.date > now)
}
