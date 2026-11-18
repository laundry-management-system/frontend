import type {
  CheckoutMode,
  OrderDetail,
  PaymentMethod,
  PaymentTxn,
  PaymentTxnStatus,
} from './types'

export const PAYMENT_METHOD_KEY: Record<PaymentMethod, 'cash' | 'qr'> = {
  CASH: 'cash',
  BANK_TRANSFER: 'qr',
}

export const PAYMENT_TXN_KEY: Record<PaymentTxnStatus, string> = {
  CONFIRMED: 'confirmed',
  VOIDED: 'voided',
  REFUNDED: 'refunded',
}

/** Đơn Hoàn thành: chưa trả tiền thì thu và trả đồ cùng lúc, đã trả thì chỉ trả đồ. */
export function checkoutMode(
  o: Pick<OrderDetail, 'status' | 'paymentStatus'>,
): CheckoutMode | null {
  if (o.status !== 'COMPLETED') return null
  return o.paymentStatus === 'PAID' ? 'handover' : 'checkout'
}

/** `null` khi khách đưa chưa đủ (không hỗ trợ trả một phần). */
export const changeDue = (total: number, given: number | '') =>
  given === '' || given < total ? null : given - total

export function discrepancyOf(expected: number, received: number) {
  const kind: 'short' | 'over' | 'none' =
    received < expected ? 'short' : received > expected ? 'over' : 'none'
  return { kind, diff: Math.abs(received - expected) }
}

export const confirmedTxn = (txns: PaymentTxn[]) =>
  txns.find((t) => t.status === 'CONFIRMED') ?? null
