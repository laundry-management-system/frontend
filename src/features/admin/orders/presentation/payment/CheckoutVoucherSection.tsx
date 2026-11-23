import { Text } from '@mantine/core'
import { VoucherTag } from '@/features/admin/vouchers'
import { toApiError } from '@/shared/common/api/apiError'
import { formatMoney } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { useApplyOrderVoucher } from '../../application/mutations/useApplyOrderVoucher'
import { isVoucherLocked } from '../../domain/rules'
import type { OrderDetail } from '../../domain/types'
import { InfoSection } from '../InfoRow'
import { VoucherField } from './VoucherField'

interface Props {
  order: OrderDetail
  payOnly?: boolean
  paying: boolean
  checkoutPending: boolean
}

export function CheckoutVoucherSection({ order, payOnly, paying, checkoutPending }: Props) {
  // Còn đổi được voucher khi chưa thu tiền, kể cả đơn đã thành 0đ (tự PAID) nhờ voucher
  const voucherEditable = paying || (order.payableAmount === 0 && !!order.voucherCode)
  const applyVoucher = useApplyOrderVoucher()
  const handleVoucherApply = (voucherCode: string | null) =>
    applyVoucher.mutate(
      { orderId: order.id, voucherCode },
      { onError: (e) => notify.error(toApiError(e).message) },
    )
  return payOnly ? null : isVoucherLocked(order) ? (
    <InfoSection title="Voucher">
      {order.voucherCode ? (
        <Text size="sm" component="div">
          <VoucherTag code={order.voucherCode} /> −{formatMoney(order.discountAmount)} (khách tự áp)
        </Text>
      ) : (
        <Text size="sm">Không có voucher</Text>
      )}
    </InfoSection>
  ) : (
    voucherEditable && (
      <InfoSection title="Voucher">
        <VoucherField
          key={order.voucherCode ?? ''}
          appliedCode={order.voucherCode}
          subtotal={order.subtotal}
          onApply={handleVoucherApply}
          pending={applyVoucher.isPending || checkoutPending}
        />
      </InfoSection>
    )
  )
}
