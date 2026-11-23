import { Alert, Card, Stack, Stepper } from '@mantine/core'
import type { OrderDetail } from '@/features/admin/orders'

// Đã giao là bước cuối: active = số bước để mọi bước đều hiện dấu tick
const STEP_OF = {
  PENDING_CONFIRMATION: 0,
  AWAITING_DROPOFF: 0,
  RECEIVED: 0,
  PROCESSING: 1,
  COMPLETED: 2,
  DELIVERED: 4,
  CANCELLED: 0,
} as const

export function OrderStatusCard({ order }: { order: OrderDetail }) {
  return (
    <Card mb="lg">
      <Stack gap="md">
        {order.status === 'CANCELLED' ? (
          <Alert color="danger" title="Đơn đã hủy">
            Lý do xem trong lịch sử trạng thái.
          </Alert>
        ) : (
          <Stepper active={STEP_OF[order.status]} size="sm" allowNextStepsSelect={false}>
            <Stepper.Step label="Mới nhận" />
            <Stepper.Step label="Đang xử lý" />
            <Stepper.Step label="Hoàn thành" />
            <Stepper.Step label="Đã giao" />
          </Stepper>
        )}
      </Stack>
    </Card>
  )
}
