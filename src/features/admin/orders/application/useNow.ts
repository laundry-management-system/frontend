import { useEffect, useState } from 'react'

/** Thời điểm hiện tại (ms), tự cập nhật để cờ TRỄ đổi khi trang mở lâu. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
