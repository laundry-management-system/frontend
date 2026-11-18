import { useEffect, useRef, useState } from 'react'
import type { ShiftDetail } from '../domain/types'

/**
 * Render phiếu kết ca vào vùng in rồi mở hộp thoại in; in xong thì gỡ để không chồng lên phiếu khác.
 * Truyền `printOnMount` để in ngay khi màn hình hiện (vừa kết ca xong).
 */
export function usePrintShiftSlip(printOnMount?: ShiftDetail) {
  const [slip, setSlip] = useState<ShiftDetail | null>(printOnMount ?? null)
  const printAfterRender = useRef(printOnMount != null)

  useEffect(() => {
    if (!slip || !printAfterRender.current) return
    printAfterRender.current = false
    window.print()
  }, [slip])

  useEffect(() => {
    const clear = () => setSlip(null)
    window.addEventListener('afterprint', clear)
    return () => window.removeEventListener('afterprint', clear)
  }, [])

  const print = (next: ShiftDetail) => {
    printAfterRender.current = true
    setSlip(next)
  }

  return { slip, print }
}
