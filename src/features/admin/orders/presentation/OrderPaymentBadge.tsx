import { Badge } from '@mantine/core'
import { StatusBadge } from '@/shared/admin/ui'
import type { OrderStatus, PaymentStatus } from '../domain/types'

interface OrderPaymentBadgeProps {
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentClaimedAt?: string | null
}

/** Thẻ thanh toán của đơn (+ "Khách báo đã CK"); đơn hủy không hiện. Dùng chung cho danh sách và chi tiết. */
export function OrderPaymentBadge({
  status,
  paymentStatus,
  paymentClaimedAt,
}: OrderPaymentBadgeProps) {
  if (status === 'CANCELLED') return null
  return (
    <>
      <StatusBadge group="payment" statusKey={paymentStatus.toLowerCase()} size="sm" />
      {paymentClaimedAt && paymentStatus === 'UNPAID' && (
        <Badge variant="light" color="warning" size="sm" ml={4}>
          Khách báo đã CK
        </Badge>
      )}
    </>
  )
}
