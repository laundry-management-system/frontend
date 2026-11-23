import { Button, Grid, Modal, Stack } from '@mantine/core'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import type { CheckoutMode, OrderDetail } from '../../domain/types'
import { CheckoutOrderSummary } from './CheckoutOrderSummary'
import { CheckoutPaymentSection } from './CheckoutPaymentSection'
import { CheckoutReceiverSection } from './CheckoutReceiverSection'
import { CheckoutVoucherSection } from './CheckoutVoucherSection'
import { type CheckoutDone, useCheckoutModal } from './useCheckoutModal'

export type { CheckoutDone }

/** Khách lấy đồ: thu tiền (nếu chưa trả) và trả đồ trong một lần xác nhận. Mount khi mở. */
export function CheckoutModal({
  order,
  mode,
  onClose,
  onDiscrepancy,
  onDone,
  payOnly,
}: {
  order: OrderDetail
  mode: CheckoutMode
  /** Chỉ xác nhận đã nhận tiền (chuyển khoản), không trả đồ */
  payOnly?: boolean
  onClose: () => void
  onDiscrepancy: () => void
  onDone: (r: CheckoutDone) => void
}) {
  const checkout = useCheckoutModal({ order, mode, payOnly, onClose, onDone })
  const { paying, noShift, paymentReady, form, submit, isPending } = checkout

  const title = (
    <span>
      {payOnly ? 'Xác nhận đã nhận tiền' : paying ? 'Thanh toán & trả đồ' : 'Trả đồ'}{' '}
      <OrderCode code={order.orderCode} />
    </span>
  )

  return (
    <Modal opened onClose={onClose} size={payOnly ? 560 : 900} title={title}>
      <form onSubmit={submit} noValidate>
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: payOnly ? 12 : 5 }}>
            <CheckoutOrderSummary order={order} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: payOnly ? 12 : 7 }}>
            <Stack gap="lg">
              <CheckoutVoucherSection
                order={order}
                payOnly={payOnly}
                paying={paying}
                checkoutPending={isPending}
              />
              <CheckoutPaymentSection
                order={order}
                payOnly={payOnly}
                checkout={checkout}
                onDiscrepancy={onDiscrepancy}
              />
              {!payOnly && <CheckoutReceiverSection form={form} />}
            </Stack>
          </Grid.Col>
        </Grid>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button type="submit" disabled={!paymentReady || noShift} loading={isPending}>
            {payOnly ? 'Xác nhận đã nhận tiền' : paying ? 'Thu tiền & trả đồ' : 'Xác nhận trả đồ'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
