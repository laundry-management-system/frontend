import { Stack, Text } from '@mantine/core'
import { StatusBadge } from '@/shared/admin/ui'
import { ORDER_STATUS_KEY, type OrderStatus } from '../domain/types'

interface OrderStatusCellProps {
  status: OrderStatus
  isOverdue?: boolean
}

/** Trạng thái đơn + cờ TRỄ; đơn hủy gạch ngang. */
export function OrderStatusCell({ status, isOverdue }: OrderStatusCellProps) {
  if (status === 'CANCELLED')
    return (
      <Text td="line-through" c="dimmed" size="sm">
        Đã hủy
      </Text>
    )
  return (
    <Stack gap={6} align="flex-start">
      <StatusBadge group="order" statusKey={ORDER_STATUS_KEY[status]} size="sm" />
      {isOverdue && <StatusBadge group="flag" statusKey="late" size="sm" />}
    </Stack>
  )
}
