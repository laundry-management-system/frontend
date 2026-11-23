import { Badge, Group, Text, Tooltip } from '@mantine/core'
import { LuArrowRight } from 'react-icons/lu'
import { CopyableCode, type DataTableColumn } from '@/shared/admin/ui'
import {
  formatChangedAt,
  formatPriceValue,
  priceFieldLabel,
  priceRowDelta,
} from '../domain/priceHistory'
import type { PriceHistoryRow } from '../domain/types'

const NOWRAP = { whiteSpace: 'nowrap' } as const
const DELTA_COLOR = { up: 'success', down: 'warning', same: 'neutral' } as const

/** Bảng lịch sử giá chỉ đọc: không có cột thao tác */
export const PRICE_HISTORY_COLUMNS: DataTableColumn<PriceHistoryRow>[] = [
  {
    name: 'changedAt',
    label: 'Thời gian',
    width: 130,
    render: (r) => formatChangedAt(r.changedAt),
  },
  {
    name: 'serviceCode',
    label: 'Mã',
    width: 100,
    render: (r) => r.serviceCode && <CopyableCode code={r.serviceCode} size="sm" />,
  },
  { name: 'service', label: 'Dịch vụ', width: 170, render: (r) => r.serviceName },
  {
    name: 'field',
    label: 'Thay đổi',
    width: 180,
    render: (r) => priceFieldLabel(r.field, r.washModeName),
  },
  {
    name: 'values',
    label: 'Cũ → Mới',
    width: 300,
    render: (r) => (
      <Group gap={6} wrap="nowrap">
        <Text size="sm" c="dimmed" style={NOWRAP}>
          {formatPriceValue(r.field, r.oldValue)}
        </Text>
        <LuArrowRight size={14} aria-label="thành" />
        <Text size="sm" fw={500} style={NOWRAP}>
          {formatPriceValue(r.field, r.newValue)}
        </Text>
      </Group>
    ),
  },
  {
    name: 'delta',
    label: 'Chênh lệch',
    width: 110,
    render: (r) => {
      const delta = priceRowDelta(r)
      return delta ? (
        <Badge color={DELTA_COLOR[delta.direction]} variant="light">
          {delta.label}
        </Badge>
      ) : (
        <Text size="sm" c="dimmed">
          —
        </Text>
      )
    },
  },
  { name: 'changedBy', label: 'Người sửa', width: 160, render: (r) => r.changedByName },
  {
    name: 'reason',
    label: 'Lý do',
    width: 220,
    render: (r) => (
      <Tooltip label={r.reason} multiline maw={320} disabled={!r.reason}>
        <Text size="sm" lineClamp={1}>
          {r.reason || '—'}
        </Text>
      </Tooltip>
    ),
  },
]
