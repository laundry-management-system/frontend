import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { ordersApi } from '../data/ordersApi'
import type { ReceiptData } from '../domain/types'

export interface PrintableReceipt {
  data: ReceiptData
  qrSvg: string
}

/**
 * Lấy phiếu từ BE (BE đánh dấu đã in), vẽ QR rồi mở hộp thoại in sau khi phiếu đã render.
 * Nhận nhiều đơn (lượt nhận 2 đơn): in lần lượt theo thứ tự truyền vào.
 */
export function usePrintReceipt() {
  const [receipts, setReceipts] = useState<PrintableReceipt[]>([])
  const [isPrinting, setIsPrinting] = useState(false)
  const printAfterRender = useRef(false)

  useEffect(() => {
    if (!receipts.length || !printAfterRender.current) return
    printAfterRender.current = false
    window.print()
  }, [receipts])

  const print = async (orderIds: number | number[]) => {
    setIsPrinting(true)
    try {
      const ids = Array.isArray(orderIds) ? orderIds : [orderIds]
      const next = await Promise.all(
        ids.map(async (id) => {
          const { data, qrUrl } = await ordersApi.receipt(id)
          return { data, qrSvg: await QRCode.toString(qrUrl, { type: 'svg', margin: 0 }) }
        }),
      )
      printAfterRender.current = true
      setReceipts(next)
    } finally {
      setIsPrinting(false)
    }
  }

  return { receipts, print, isPrinting }
}
