import { Badge } from '@mantine/core'
import { ORDER_CHANNEL_LABEL, type OrderChannel } from '../domain/types'

/** Thẻ kênh đặt đơn (Online / Tại quầy), dùng chung cho danh sách và chi tiết đơn. */
export function OrderChannelBadge({ channel }: { channel: OrderChannel }) {
  return (
    <Badge
      size="sm"
      variant="light"
      color={channel === 'ONLINE' ? 'blue' : 'gray'}
      style={{ whiteSpace: 'nowrap' }}
    >
      {ORDER_CHANNEL_LABEL[channel]}
    </Badge>
  )
}
