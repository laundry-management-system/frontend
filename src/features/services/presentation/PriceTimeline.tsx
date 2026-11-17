import { Button, Divider, Group, Skeleton, Stack, Text } from '@mantine/core'
import { Fragment } from 'react'
import { LuCloudOff, LuInfo } from 'react-icons/lu'
import { formatMoney } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui'
import { usePriceTimeline } from '../application/queries/usePriceTimeline'
import { PriceLine } from './PriceLine'

/** Diễn biến đơn giá của dịch vụ trên toàn bộ lịch sử, không theo bộ lọc ngày */
export function PriceTimeline({ serviceId }: { serviceId: number }) {
  const { currentPrice, unitLabel, timeline, isLoading, isError, refetch } =
    usePriceTimeline(serviceId)

  if (isError)
    return (
      <EmptyState
        icon={<LuCloudOff size={32} />}
        title="Không tải được diễn biến giá"
        description="Vui lòng kiểm tra kết nối rồi thử lại."
        action={
          <Button variant="secondary" onClick={refetch}>
            Thử lại
          </Button>
        }
      />
    )
  if (isLoading) return <Skeleton h={220} />
  if (!timeline || currentPrice == null)
    return (
      <Text size="sm" c="dimmed">
        Chưa có thay đổi đơn giá.
      </Text>
    )

  const periodList = timeline.periods.map((p, i) => (
    <Fragment key={p.label}>
      {i > 0 && <Divider />}
      <Group justify="space-between" wrap="nowrap" py={8}>
        <Text size="sm" c={p.current ? undefined : 'dimmed'} fw={p.current ? 500 : undefined}>
          {p.label}
        </Text>
        <Text size="sm" className="text-money" fw={p.current ? 600 : undefined}>
          {formatMoney(p.price)}
        </Text>
      </Group>
    </Fragment>
  ))

  return (
    <Stack gap="md">
      <Group justify="space-between" align="baseline">
        <Text size="sm" c="dimmed">
          Đang áp dụng
        </Text>
        <Text size="lg" fw={700} className="text-money">
          {formatMoney(currentPrice)}
          {unitLabel && ` / ${unitLabel}`}
        </Text>
      </Group>
      {timeline.points.length > 1 && <PriceLine points={timeline.points} />}
      {timeline.points.length > 0 ? (
        <Stack gap={0}>{periodList}</Stack>
      ) : (
        <Text size="sm" c="dimmed">
          Chưa có thay đổi đơn giá.
        </Text>
      )}
      {timeline.reminder && (
        <Group gap={6} wrap="nowrap" align="flex-start" c="dimmed">
          <LuInfo size={14} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
          <Text size="xs">{timeline.reminder}</Text>
        </Group>
      )}
    </Stack>
  )
}
