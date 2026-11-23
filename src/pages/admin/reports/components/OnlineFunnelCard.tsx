import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { LuGlobe } from 'react-icons/lu'
import { METRIC_INFO, type OrderReport } from '@/features/admin/reports'
import { EmptyState, InfoLabel } from '@/shared/admin/ui'
import { formatNumber, formatOneDecimal } from '@/shared/common/lib/format'

const FUNNEL_INFO = `${METRIC_INFO.onlineConfirmRate} Yêu cầu tính theo ngày tạo, còn xác nhận và hủy tính theo ngày xảy ra sự kiện, nên các số có thể không cộng khớp.`

export function OnlineFunnelCard({ online }: { online: NonNullable<OrderReport['online']> }) {
  const stats = [
    { label: 'Yêu cầu', value: formatNumber(online.requests) },
    { label: 'Xác nhận', value: formatNumber(online.confirmed) },
    { label: 'Từ chối / hủy', value: formatNumber(online.cancelled) },
    {
      label: 'Tỉ lệ xác nhận',
      value:
        online.confirmRatePercent === null ? '' : `${formatOneDecimal(online.confirmRatePercent)}%`,
    },
    {
      label: 'Chờ xác nhận TB',
      value:
        online.avgConfirmMinutes === null
          ? ''
          : `${formatOneDecimal(online.avgConfirmMinutes)} phút`,
    },
  ]
  return (
    <Card style={{ flex: '1 1 360px', minWidth: 0 }}>
      <Title order={5} mb="md">
        <InfoLabel info={FUNNEL_INFO}>Đặt online</InfoLabel>
      </Title>
      {online.requests === 0 && online.cancelled === 0 ? (
        <EmptyState
          icon={<LuGlobe size={32} />}
          title="Chưa có yêu cầu đặt online"
          description="Số yêu cầu, xác nhận và hủy của đơn online sẽ hiện ở đây."
        />
      ) : (
        <Group gap="xl" align="flex-start">
          {stats.map((s) => (
            <Stack key={s.label} gap={2}>
              <Text size="sm" c="dimmed">
                {s.label}
              </Text>
              <Text fw={600} size="xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </Text>
            </Stack>
          ))}
        </Group>
      )}
    </Card>
  )
}
