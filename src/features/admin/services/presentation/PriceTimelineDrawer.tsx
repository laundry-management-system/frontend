import { Drawer, Group, Stack, Text } from '@mantine/core'
import { CopyableCode, InfoLabel } from '@/shared/admin/ui'
import type { Service } from '../domain/types'
import { PriceTimeline } from './PriceTimeline'

const TIMELINE_INFO =
  'Mọi lần đổi đơn giá, trạng thái, giờ xử lý và phụ phí từ trước tới nay. Đơn đã tạo giữ đơn giá đã chốt lúc nhận.'

/** Diễn biến đơn giá của một dịch vụ trên toàn bộ lịch sử, mở từ bảng giá */
export function PriceTimelineDrawer({
  service,
  onClose,
}: {
  service: Service | null
  onClose: () => void
}) {
  const title = <InfoLabel info={TIMELINE_INFO}>Diễn biến đơn giá</InfoLabel>
  return (
    <Drawer opened={service != null} onClose={onClose} position="right" size="md" title={title}>
      {service && (
        <Stack gap="lg">
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Text fw={600}>{service.name}</Text>
            <CopyableCode code={service.code} size="sm" />
          </Group>
          <PriceTimeline serviceId={service.id} />
        </Stack>
      )}
    </Drawer>
  )
}
