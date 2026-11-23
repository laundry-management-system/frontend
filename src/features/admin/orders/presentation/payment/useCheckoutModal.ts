import { useForm, schemaResolver } from '@mantine/form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { invalidateShifts, useCurrentShift } from '@/features/admin/shifts'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { CheckoutError, useCheckout } from '../../application/mutations/useCheckout'
import { useVietQr } from '../../application/queries/useVietQr'
import { deliverySchema, type DeliveryValues } from '../../application/schemas'
import { changeDue } from '../../domain/payment'
import type { CheckoutMode, DeliveryResult, OrderDetail, PaymentTxn } from '../../domain/types'
import type { PaymentValue } from './PaymentFields'

export interface CheckoutDone {
  payment: PaymentTxn | null
  /** `null` khi đã thu tiền nhưng bước trả đồ lỗi */
  delivery: DeliveryResult | null
  cash: { given: number; change: number } | null
}

interface Args {
  order: OrderDetail
  mode: CheckoutMode
  payOnly?: boolean
  onClose: () => void
  onDone: (r: CheckoutDone) => void
}

const EMPTY_PAYMENT: PaymentValue = { method: 'CASH', given: '', referenceCode: '' }

export function useCheckoutModal({ order, mode, payOnly, onClose, onDone }: Args) {
  const paying = mode === 'checkout'
  const queryClient = useQueryClient()
  const shift = useCurrentShift()
  // Thu tiền phải có ca đang mở; chỉ trả đồ (đã thanh toán trước) thì không cần
  const noShift = paying && shift.data?.current === null
  const [payment, setPayment] = useState<PaymentValue>(
    payOnly ? { ...EMPTY_PAYMENT, method: 'BANK_TRANSFER' } : EMPTY_PAYMENT,
  )
  const qr = useVietQr(order.orderCode, paying && !payOnly && payment.method === 'BANK_TRANSFER')
  const checkout = useCheckout()
  const form = useForm<DeliveryValues>({
    initialValues: { mode: 'SELF', receiverName: '', receiverRelation: '' },
    validate: schemaResolver(deliverySchema, { sync: true }),
  })
  const proxy = form.values.mode === 'PROXY'

  const change = changeDue(order.payableAmount, payment.given)
  const paymentReady =
    !paying || (payment.method === 'CASH' ? change !== null : payOnly || !!qr.data)
  const cash =
    paying && payment.method === 'CASH' && change !== null
      ? { given: Number(payment.given), change }
      : null

  const submit = form.onSubmit((v) =>
    checkout.mutate(
      {
        order,
        mode,
        payOnly,
        method: payment.method,
        referenceCode: payment.referenceCode,
        receiverName: proxy ? v.receiverName.trim() : undefined,
        receiverRelation: proxy ? v.receiverRelation.trim() : undefined,
      },
      {
        onSuccess: (r) => {
          notify.success(
            payOnly ? 'Đã xác nhận nhận tiền' : paying ? 'Đã thu tiền và trả đồ' : 'Đã trả đồ',
          )
          if (!payOnly) onDone({ ...r, cash })
          onClose()
        },
        onError: (e) => {
          if (e instanceof CheckoutError) {
            notify.error(`Đã thu tiền, chưa trả đồ được: ${toApiError(e.reason).message}`)
            onDone({ payment: e.payment, delivery: null, cash })
            onClose()
            return
          }
          const err = toApiError(e)
          notify.error(err.message)
          // Ca vừa bị kết ở máy khác: tải lại để hiện cảnh báo Chưa mở ca
          if (err.status === 409) invalidateShifts(queryClient)
          // Lỗi nghiệp vụ: đơn đã được tải lại, đóng để thấy trạng thái mới; lỗi mạng thì giữ dữ liệu đã nhập
          if (err.status) onClose()
        },
      },
    ),
  )

  return {
    paying,
    noShift,
    payment,
    setPayment,
    qr,
    form,
    paymentReady,
    submit,
    isPending: checkout.isPending,
  }
}

export type CheckoutState = ReturnType<typeof useCheckoutModal>
