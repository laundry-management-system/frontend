import { useEffect, useState } from 'react'

/** Thời điểm hiện tại, tự làm mới sau mỗi `intervalMs` để nội dung theo giờ cập nhật không cần tải lại trang. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
