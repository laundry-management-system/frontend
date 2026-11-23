import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { ModalFooter, Money, OrderCode } from '@/shared/admin/ui'
import { formatDateTime } from '@/shared/common/lib/format'
import type { OrderDetail } from '../../domain/types'

/** Một cửa xử lý khách báo đã chuyển khoản: nhận tiền (CheckoutModal payOnly) hoặc từ chối (RejectPaymentClaimModal). */
export function PaymentClaimChooserModal({
  order,
  onConfirm,
  onReject,
  onClose,
}: {
  order: OrderDetail
  onConfirm: () => void
  onReject: () => void
  onClose: () => void
}) {
  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <span>
          Xử lý thanh toán đơn <OrderCode code={order.orderCode} />
        </span>
      }
    >
      <Stack>
        <Group justify="space-between">
          <Text c="dimmed">Cần thu</Text>
          <Money value={order.payableAmount} />
        </Group>
        {order.paymentClaimedAt && (
          <Group justify="space-between">
            <Text c="dimmed">Khách báo chuyển khoản lúc</Text>
            <Text>{formatDateTime(order.paymentClaimedAt).slice(0, 16)}</Text>
          </Group>
        )}
        <ModalFooter>
          <Button variant="light" color="danger" onClick={onReject}>
            Từ chối
          </Button>
          <Button onClick={onConfirm}>Xác nhận đã nhận tiền</Button>
        </ModalFooter>
      </Stack>
    </Modal>
  )
}
