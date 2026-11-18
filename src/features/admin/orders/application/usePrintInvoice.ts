import { useEffect, useRef, useState } from 'react'
import type { Invoice } from '../domain/types'

/** Render hóa đơn vào vùng in rồi mở hộp thoại in; in xong thì gỡ để không chồng lên phiếu nhận. */
export function usePrintInvoice() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const printAfterRender = useRef(false)

  useEffect(() => {
    if (!invoice || !printAfterRender.current) return
    printAfterRender.current = false
    window.print()
  }, [invoice])

  useEffect(() => {
    const clear = () => setInvoice(null)
    window.addEventListener('afterprint', clear)
    return () => window.removeEventListener('afterprint', clear)
  }, [])

  const print = (next: Invoice) => {
    printAfterRender.current = true
    setInvoice(next)
  }

  return { invoice, print }
}
