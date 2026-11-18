export interface OpenStatus {
  isOpen: boolean
  /** Ví dụ "Đang mở cửa", "Đã đóng cửa". */
  title: string
  /** Ví dụ "Đóng cửa lúc 21:00", "Mở cửa ngày mai lúc 08:00". */
  detail: string
}

// Tiệm ở Việt Nam: luôn lấy giờ phút theo Asia/Ho_Chi_Minh, không theo múi giờ của thiết bị khách
const vnClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Giờ phút hiện tại ở Việt Nam dạng "HH:mm". */
export const vnTime = (now: Date) => vnClock.format(now)

/** Mở trong [open, close); đúng giờ đóng cửa là đã đóng. `open`/`close` dạng "HH:mm" nên so chuỗi được. */
export function openStatus(now: Date, open: string, close: string): OpenStatus {
  const t = vnTime(now)
  if (t >= open && t < close) {
    return { isOpen: true, title: 'Đang mở cửa', detail: `Đóng cửa lúc ${close}` }
  }
  const day = t < open ? 'hôm nay' : 'ngày mai'
  return { isOpen: false, title: 'Đã đóng cửa', detail: `Mở cửa ${day} lúc ${open}` }
}
