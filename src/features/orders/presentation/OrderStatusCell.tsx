import { Badge, Stack, Text } from '@mantine/core'
import { StatusBadge } from '@/shared/ui'
import { ORDER_STATUS_KEY, type OrderStatus, type OrderType } from '../domain/types'

interface OrderStatusCellProps {
  status: OrderStatus
  isOverdue?: boolean
  orderType?: OrderType
  whites?: boolean
}

/** Trạng thái đơn + cờ TRỄ / Giặt nhanh; đơn hủy gạch ngang. */
export function OrderStatusCell({ status, isOverdue, orderType, whites }: OrderStatusCellProps) {
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
      {orderType === 'EXPRESS' && <StatusBadge group="flag" statusKey="express" size="sm" />}
      {whites && (
        <Badge size="sm" color="gray" variant="light">
          Đồ trắng
        </Badge>
      )}
    </Stack>
  )
}
