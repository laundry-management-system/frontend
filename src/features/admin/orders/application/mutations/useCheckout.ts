import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type {
  CheckoutMode,
  DeliveryResult,
  OrderDetail,
  PaymentMethod,
  PaymentTxn,
} from '../../domain/types'
import { orderKeys } from '../queryKeys'

/** Thanh toán đã ghi nhận nhưng bước trả đồ lỗi: không được thu lại, chỉ thử trả đồ. */
export class CheckoutError extends Error {
  readonly paid = true
  readonly payment: PaymentTxn
  readonly reason: unknown

  constructor(payment: PaymentTxn, reason: unknown) {
    super('Đã thu tiền, chưa trả đồ được')
    this.payment = payment
    this.reason = reason
  }
}

export interface CheckoutVars {
  order: OrderDetail
  mode: CheckoutMode
  method: PaymentMethod
  referenceCode?: string
  /** Bỏ trống khi khách tự nhận */
  receiverName?: string
  receiverRelation?: string
}

export interface CheckoutResult {
  payment: PaymentTxn | null
  delivery: DeliveryResult
}

// BE chưa có lệnh gộp (handoff 011 #1): luôn thu tiền trước, vì BE chặn giao đơn chưa thanh toán
async function checkout(v: CheckoutVars): Promise<CheckoutResult> {
  const payment =
    v.mode === 'checkout'
      ? await ordersApi.confirmPayment(v.order.orderCode, {
          amount: v.order.totalAmount,
          method: v.method,
          referenceCode: v.referenceCode?.trim() || undefined,
        })
      : null
  try {
    const delivery = await ordersApi.deliver(
      v.order.orderCode,
      v.receiverName ? { receiverName: v.receiverName, receiverRelation: v.receiverRelation } : {},
    )
    return { payment, delivery }
  } catch (e) {
    if (payment) throw new CheckoutError(payment, e)
    throw e
  }
}

export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkout,
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
