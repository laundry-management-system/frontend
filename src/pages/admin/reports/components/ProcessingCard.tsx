import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { LuClock } from 'react-icons/lu'
import { METRIC_INFO, type OrderReport } from '@/features/admin/reports'
import { EmptyState, InfoLabel } from '@/shared/admin/ui'
import { formatNumber, formatOneDecimal } from '@/shared/common/lib/format'

const hours = (v: number | null) => (v === null ? '' : `${formatOneDecimal(v)} giờ`)

export function ProcessingCard({ processing: p }: { processing: OrderReport['processing'] }) {
  const stats = [
    { label: 'Thời gian xử lý TB', info: METRIC_INFO.processingTime, value: hours(p.avgHours) },
    { label: 'Trung vị', info: METRIC_INFO.medianProcessing, value: hours(p.medianHours) },
    {
      label: 'Tỉ lệ đúng hạn',
      info: METRIC_INFO.onTimeRate,
      value: p.onTimeRatePercent === null ? '' : `${formatOneDecimal(p.onTimeRatePercent)}%`,
      sub: `${formatNumber(p.onTimeOrders)}/${formatNumber(p.completedOrders)} đơn`,
    },
  ]
  return (
    <Card style={{ flex: '1 1 360px', minWidth: 0 }}>
      <Title order={5} mb="md">
        Thời gian xử lý
      </Title>
      {p.completedOrders === 0 ? (
        <EmptyState
          icon={<LuClock size={32} />}
          title="Chưa có đơn hoàn tất trong kỳ"
          description="Thời gian xử lý từ nhận đến sẵn sàng trả sẽ hiện ở đây."
        />
      ) : (
        <Group gap="xl" align="flex-start">
          {stats.map((s) => (
            <Stack key={s.label} gap={2}>
              <Text size="sm" c="dimmed">
                <InfoLabel info={s.info}>{s.label}</InfoLabel>
              </Text>
              <Text fw={600} size="xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </Text>
              {s.sub && (
                <Text size="xs" c="dimmed">
                  {s.sub}
                </Text>
              )}
            </Stack>
          ))}
        </Group>
      )}
    </Card>
  )
}
