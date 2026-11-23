import { Badge, Button, Divider, Group, Skeleton, Stack, Text } from '@mantine/core'
import { Fragment } from 'react'
import { LuArrowRight, LuCloudOff, LuInfo } from 'react-icons/lu'
import { formatMoney } from '@/shared/common/lib/format'
import { EmptyState } from '@/shared/admin/ui'
import { usePriceTimeline } from '../application/queries/usePriceTimeline'
import {
  formatChangedAt,
  formatPriceValue,
  priceFieldLabel,
  priceRowDelta,
} from '../domain/priceHistory'
import type { PriceHistoryRow } from '../domain/types'
import { PriceLine } from './PriceLine'

const DELTA_COLOR = { up: 'success', down: 'warning', same: 'neutral' } as const

function ChangeItem({ row }: { row: PriceHistoryRow }) {
  const delta = priceRowDelta(row)
  return (
    <Stack gap={4} py={8}>
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Text size="sm" fw={500}>
          {priceFieldLabel(row.field, row.washModeName)}
        </Text>
        <Text size="xs" c="dimmed" ta="right">
          {formatChangedAt(row.changedAt)} · {row.changedByName}
        </Text>
      </Group>
      <Group gap={6} wrap="nowrap">
        <Text size="sm" c="dimmed">
          {formatPriceValue(row.field, row.oldValue)}
        </Text>
        <LuArrowRight size={14} aria-label="thành" />
        <Text size="sm" fw={600}>
          {formatPriceValue(row.field, row.newValue)}
        </Text>
        {delta && (
          <Badge color={DELTA_COLOR[delta.direction]} variant="light" size="sm">
            {delta.label}
          </Badge>
        )}
      </Group>
      {row.reason && (
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
          {row.reason}
        </Text>
      )}
    </Stack>
  )
}

/** Diễn biến của một dịch vụ trên toàn bộ lịch sử, không theo bộ lọc ngày */
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
        Chưa có thay đổi nào.
      </Text>
    )

  const changeList = timeline.changes.map((c, i) => (
    <Fragment key={`${c.logId}-${c.field}`}>
      {i > 0 && <Divider />}
      <ChangeItem row={c} />
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
      {timeline.reminder && (
        <Group gap={6} wrap="nowrap" align="flex-start" c="dimmed">
          <LuInfo size={14} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
          <Text size="xs">{timeline.reminder}</Text>
        </Group>
      )}
      <Stack gap={0}>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase">
          {`${timeline.changes.length} thay đổi`}
        </Text>
        {timeline.changes.length > 0 ? (
          changeList
        ) : (
          <Text size="sm" c="dimmed" mt="xs">
            Chưa có thay đổi nào.
          </Text>
        )}
      </Stack>
    </Stack>
  )
}
