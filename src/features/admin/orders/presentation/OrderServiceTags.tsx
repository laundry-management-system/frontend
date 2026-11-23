import { Badge, Group } from '@mantine/core'
import { StatusBadge } from '@/shared/admin/ui'
import type { OrderType } from '../domain/types'

interface OrderServiceTagsProps {
  orderType: OrderType
  washWhitesSeparately?: boolean
  direction?: 'row' | 'column'
}

/** Thẻ loại dịch vụ của đơn (Giặt nhanh / Đồ trắng); đơn tiêu chuẩn không đồ trắng thì không hiện gì. */
export function OrderServiceTags({
  orderType,
  washWhitesSeparately,
  direction = 'column',
}: OrderServiceTagsProps) {
  const express = orderType === 'EXPRESS'
  if (!express && !washWhitesSeparately) return null
  return (
    <Group
      gap={direction === 'column' ? 6 : 'xs'}
      align="flex-start"
      style={{ flexDirection: direction }}
    >
      {express && <StatusBadge group="flag" statusKey="express" size="sm" />}
      {washWhitesSeparately && (
        <Badge size="sm" color="gray" variant="light">
          Đồ trắng
        </Badge>
      )}
    </Group>
  )
}
