import { Group, NumberInput, SimpleGrid, Text } from '@mantine/core'
import { memo } from 'react'
import { formatMoney } from '@/shared/lib/format'
import { type DenominationCounts, denominationTotal } from '../domain/closing'
import { DENOMINATIONS } from '../domain/types'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
const ROW = {
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--radius-control)',
  padding: '4px 8px',
}

interface DenominationTableProps {
  counts: DenominationCounts
  /** Bỏ trống khi readOnly */
  onChange?: (counts: DenominationCounts) => void
  /** Giới hạn số tờ mỗi mệnh giá (VD để lại két ≤ số tờ đã đếm); có thì chỉ hiện mệnh giá có tờ */
  max?: DenominationCounts
  totalLabel?: string
  /** Chỉ xem (ca đã kết): hiện số tờ dạng chữ, bỏ mệnh giá 0 tờ */
  readOnly?: boolean
}

/**
 * Nhập tiền mặt theo số tờ từng mệnh giá; tổng các dòng là số tiền, không nhập tay.
 * memo: 9 ô nhập, trang kết ca render lại mỗi phím gõ ở ô khác; props (state, setter) giữ nguyên tham chiếu.
 */
export const DenominationTable = memo(function DenominationTable({
  counts,
  onChange,
  max,
  totalLabel = 'Tiền mặt thực đếm',
  readOnly,
}: DenominationTableProps) {
  const setCount = (value: number, v: number | string) =>
    onChange?.({ ...counts, [value]: typeof v === 'number' ? v : 0 })

  const shown = readOnly
    ? DENOMINATIONS.filter((d) => (counts[d] ?? 0) > 0)
    : max
      ? DENOMINATIONS.filter((d) => (max[d] ?? 0) > 0)
      : DENOMINATIONS

  const rows = shown.map((d) => (
    <Group key={d} gap="xs" wrap="nowrap" style={ROW}>
      <Text size="sm" fw={600} w={72} style={TABULAR}>
        {formatMoney(d)}
      </Text>
      <Text size="sm" c="dimmed">
        ×
      </Text>
      {readOnly ? (
        <Text size="sm" fw={600} w={64} style={TABULAR}>
          {counts[d]} tờ
        </Text>
      ) : (
        <NumberInput
          aria-label={`Số tờ ${formatMoney(d)}`}
          size="xs"
          w={64}
          min={0}
          max={max?.[d]}
          clampBehavior="strict"
          allowNegative={false}
          allowDecimal={false}
          hideControls
          placeholder="0"
          value={counts[d] || ''}
          onChange={(v) => setCount(d, v)}
        />
      )}
      {max && (
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          / {max[d]} tờ
        </Text>
      )}
      <Text
        size="sm"
        ta="right"
        style={{ ...TABULAR, flex: 1 }}
        c={counts[d] ? undefined : 'dimmed'}
      >
        {counts[d] ? formatMoney(d * (counts[d] ?? 0)) : '0đ'}
      </Text>
    </Group>
  ))

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" verticalSpacing="xs">
        {rows}
      </SimpleGrid>
      <Group
        justify="space-between"
        mt="sm"
        p="sm"
        bg="var(--ds-muted)"
        style={{ borderRadius: 'var(--radius-control)' }}
      >
        <Text fw={600}>{totalLabel}</Text>
        <Text fw={700} size="xl" style={TABULAR}>
          {formatMoney(denominationTotal(counts))}
        </Text>
      </Group>
    </>
  )
})
