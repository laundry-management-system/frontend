// Việt Nam cố định UTC+7, không giờ mùa hè: cộng hằng số rồi đọc getter UTC (R6).
const VN_OFFSET_MS = 7 * 3_600_000
const DAY_MS = 86_400_000

const pad = (n: number) => String(n).padStart(2, '0')
const isoDate = (vn: Date) => `${vn.getUTCFullYear()}-${pad(vn.getUTCMonth() + 1)}-${pad(vn.getUTCDate())}`
const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** `days` ngày VN kể từ ngày chứa `from`, giờ tròn trong [mở, đóng) và >= `earliest`; bỏ ngày rỗng. */
function slotsFrom(from: number, days: number, openingTime: string, closingTime: string, earliest: number) {
  const open = minutesOf(openingTime)
  const close = minutesOf(closingTime)
  const startVn = Math.floor((from + VN_OFFSET_MS) / DAY_MS) * DAY_MS
  return Array.from({ length: days }, (_, d) => {
    const dayVn = startVn + d * DAY_MS
    const hours: number[] = []
    for (let h = 0; h < 24; h++) {
      const instant = dayVn + h * 3_600_000 - VN_OFFSET_MS
      if (h * 60 >= open && h * 60 < close && instant >= earliest) hours.push(h)
    }
    return { date: isoDate(new Date(dayVn)), hours }
  }).filter((s) => s.hours.length > 0)
}

/** Ngày hôm nay ở Việt Nam, dạng YYYY-MM-DD. `now` là epoch ms. */
export function vnToday(now: number): string {
  return isoDate(new Date(now + VN_OFFSET_MS))
}

/** Hôm nay / ngày mai (VN) và các giờ tròn còn hợp lệ; bỏ ngày không còn giờ. Khớp AppointmentRules.appointmentError. */
export function appointmentSlots(
  now: number,
  openingTime: string,
  closingTime: string,
  minLeadHours: number,
): { date: string; hours: number[] }[] {
  return slotsFrom(now, 2, openingTime, closingTime, now + minLeadHours * 3_600_000)
}

/** Giờ nhận lại: ngày gửi tới +2 ngày (VN), giờ tròn trong giờ mở cửa, >= giờ gửi + gap. Khớp AppointmentRules.returnError. */
export function returnSlots(
  dropoffIso: string,
  openingTime: string,
  closingTime: string,
  gapHours: number,
): { date: string; hours: number[] }[] {
  const dropoff = Date.parse(dropoffIso)
  return slotsFrom(dropoff, 3, openingTime, closingTime, dropoff + gapHours * 3_600_000)
}

/** `YYYY-MM-DDTHH:00:00+07:00` cho trường appointmentAt. */
export function toAppointmentIso(date: string, hour: number): string {
  return `${date}T${pad(hour)}:00:00+07:00`
}

/** Instant (ISO) của BE → `DD/MM/YYYY HH:mm` giờ Việt Nam. */
export function formatVnDateTime(instant: string): string {
  const vn = new Date(Date.parse(instant) + VN_OFFSET_MS)
  return `${pad(vn.getUTCDate())}/${pad(vn.getUTCMonth() + 1)}/${vn.getUTCFullYear()} ${pad(vn.getUTCHours())}:${pad(vn.getUTCMinutes())}`
}
