import { Card, Stack, Text, Timeline, Title } from '@mantine/core'
import { formatDateTime } from '@/shared/lib/format'
import { EmptyState, InfoLabel } from '@/shared/ui'
import { describeHistoryValue } from '../../domain/history'
import type { OrderHistoryEntry } from '../../domain/types'

export function OrderHistoryCard({ history }: { history: OrderHistoryEntry[] }) {
  return (
    <Card>
      <Stack gap="md">
        <Title order={5}>
          <InfoLabel info="Chỉ ghi thêm, không sửa hay xóa được">Lịch sử trạng thái</InfoLabel>
        </Title>
        {history.length ? (
          <Timeline active={history.length - 1} bulletSize={14} lineWidth={2}>
            {history.map((h) => {
              const from = describeHistoryValue(h.actionType, h.oldValue)
              const to = describeHistoryValue(h.actionType, h.newValue)
              return (
                <Timeline.Item key={h.id} title={h.actionDescription}>
                  {(from || to) && <Text size="sm">{[from, to].filter(Boolean).join(' → ')}</Text>}
                  <Text size="xs" c="dimmed">
                    {formatDateTime(h.createdAt).slice(0, 16)} · {h.performedBy ?? '—'}
                  </Text>
                  {h.reason && (
                    <Text size="sm" fs="italic">
                      {h.reason}
                    </Text>
                  )}
                </Timeline.Item>
              )
            })}
          </Timeline>
        ) : (
          <EmptyState title="Chưa có lịch sử" />
        )}
      </Stack>
    </Card>
  )
}
