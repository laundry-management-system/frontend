import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { formatDateTime } from '@/shared/lib/format'
import { InfoLabel } from '@/shared/ui'
import type { NotificationResult } from '../../domain/types'

/** Lần nhắn gần nhất / số lần nhắn (BR-H02). BE chỉ trả 2 số này sau khi soạn tin (handoff 008 #6a). */
export function OrderNotifyCard({ last }: { last: NotificationResult | null }) {
  return (
    <Card>
      <Stack gap="xs">
        <Title order={5}>
          <InfoLabel
            info={last ? undefined : 'Số liệu hiện sau khi soạn tin trong lần mở trang này'}
          >
            Nhắn khách
          </InfoLabel>
        </Title>
        <Group justify="space-between">
          <Text c="dimmed">Lần nhắn gần nhất</Text>
          <Text>
            {last?.lastNotifiedAt ? formatDateTime(last.lastNotifiedAt).slice(0, 16) : '—'}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text c="dimmed">Số lần nhắn</Text>
          <Text>{last ? last.notifyCount : '—'}</Text>
        </Group>
      </Stack>
    </Card>
  )
}
