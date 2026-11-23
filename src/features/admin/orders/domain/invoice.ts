import { isExtraService } from './extraService.ts'
import type { Invoice, OrderDetail, PaymentTxn } from './types'

interface InvoiceExtra {
  shopName: string
  hotline: string
  confirmedByName: string
  cash?: Invoice['cash']
  receiver?: Invoice['receiver']
}

/** Hóa đơn BM9 dựng từ đơn và giao dịch đã xác nhận; thành tiền tính như bảng đồ ở chi tiết đơn. */
export function buildInvoice(order: OrderDetail, txn: PaymentTxn, extra: InvoiceExtra): Invoice {
  return {
    shopName: extra.shopName,
    hotline: extra.hotline,
    invoiceNo: txn.invoiceNo,
    orderCode: order.orderCode,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    receivedAt: order.receivedAt ?? '',
    paidAt: txn.paidAt,
    method: txn.method,
    referenceCode: txn.referenceCode,
    confirmedByName: extra.confirmedByName,
    lines: order.items.map((line, i) => {
      const quantity = line.billableQuantity ?? Number(line.quantity)
      return {
        index: i + 1,
        name: line.itemType,
        quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        lineTotal: Math.round(line.unitPrice * quantity),
        extra: isExtraService(line.serviceId, order.requestedServices),
      }
    }),
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    incidentDiscount: order.incidentDiscount,
    incidentCodes: order.incidentCodes,
    expressFee: order.expressFee,
    whitesFee: order.whitesFee,
    pickupFee: order.fulfillment?.pickupFee ?? 0,
    deliveryFee: order.fulfillment?.deliveryFee ?? 0,
    totalAmount: order.payableAmount,
    cash: extra.cash ?? null,
    receiver: extra.receiver ?? null,
  }
}
