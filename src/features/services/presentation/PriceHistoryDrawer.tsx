import { Badge, Drawer, Group, Paper, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuArrowRight, LuClock, LuUser } from 'react-icons/lu'
import { formatDateTime } from '@/shared/lib/format'
import { CopyableCode, InfoLabel } from '@/shared/ui'
import { formatPriceValue, priceRowDelta } from '../domain/priceHistory'
import { PRICE_FIELD_LABEL, type PriceHistoryRow } from '../domain/types'
import { PriceTimeline } from './PriceTimeline'

const DELTA_COLOR = { up: 'success', down: 'warning', same: 'neutral' } as const

function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Stack gap={6}>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" component="div">
        {title}
      </Text>
      <Paper withBorder radius="md" p="md">
        {children}
      </Paper>
    </Stack>
  )
}

function ChangeSummary({ row }: { row: PriceHistoryRow }) {
  const delta = priceRowDelta(row)
  return (
    <Stack gap="sm" p="md" bg="var(--ds-muted)" style={{ borderRadius: 'var(--radius-control)' }}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4} align="flex-start">
          <Text fw={600}>{row.serviceName}</Text>
          {row.serviceCode && <CopyableCode code={row.serviceCode} size="sm" />}
        </Stack>
        <Badge variant="light" color="neutral">
          {PRICE_FIELD_LABEL[row.field]}
        </Badge>
      </Group>
      <Group gap="sm" wrap="nowrap" align="center">
        <Text c="dimmed">{formatPriceValue(row.field, row.oldValue)}</Text>
        <LuArrowRight size={16} aria-label="thành" />
        <Text size="lg" fw={700}>
          {formatPriceValue(row.field, row.newValue)}
        </Text>
        {delta && (
          <Badge color={DELTA_COLOR[delta.direction]} variant="light">
            {delta.label}
          </Badge>
        )}
      </Group>
      <Group gap="md" c="dimmed">
        <Group gap={4}>
          <LuUser size={14} aria-hidden />
          <Text size="sm">{row.changedByName}</Text>
        </Group>
        <Group gap={4}>
          <LuClock size={14} aria-hidden />
          <Text size="sm">{formatDateTime(row.changedAt)}</Text>
        </Group>
      </Group>
    </Stack>
  )
}

interface PriceHistoryDrawerProps {
  row: PriceHistoryRow | null
  onClose: () => void
}

export function PriceHistoryDrawer({ row, onClose }: PriceHistoryDrawerProps) {
  return (
    <Drawer
      opened={row != null}
      onClose={onClose}
      position="right"
      size="md"
      title="Chi tiết thay đổi"
    >
      {row && (
        <Stack gap="lg">
          <ChangeSummary row={row} />
          <Section title="Lý do">
            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
              {row.reason}
            </Text>
          </Section>
          <Section
            title={
              <InfoLabel info="Nhiều lần đổi trong một ngày gộp thành một mốc. Đơn đã tạo giữ đơn giá đã chốt lúc nhận.">
                Diễn biến đơn giá
              </InfoLabel>
            }
          >
            <PriceTimeline serviceId={row.serviceId} />
          </Section>
        </Stack>
      )}
    </Drawer>
  )
}
