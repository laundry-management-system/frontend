import { Card, Group, SimpleGrid, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import {
  BarList,
  METRIC_INFO,
  type OperationsReport,
  type ShiftRow,
} from '@/features/admin/reports'
import { CopyableCode, InfoLabel, Money, StatTile } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'
import { formatDate, formatNumber } from '@/shared/common/lib/format'

const DIFF_CHART_SIZE = 10

interface ShiftSectionProps {
  shifts: OperationsReport['shifts']
  rows: ShiftRow[]
}

export function ShiftSection({ shifts, rows }: ShiftSectionProps) {
  // Thiếu (âm) màu đỏ, thừa (dương) màu vàng; chỉ vẽ ca lệch nhiều nhất
  const diffItems = rows
    .filter((r) => r.difference !== 0)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, DIFF_CHART_SIZE)
    .map((r) => ({
      key: r.shiftId,
      value: r.difference,
      display: <Money value={r.difference} />,
      color: r.difference < 0 ? 'var(--tone-danger-solid)' : 'var(--tone-warning-solid)',
      label: (
        <Group gap="sm" wrap="nowrap">
          <Link to={PATHS.shiftDetail(r.shiftId)}>
            <CopyableCode code={r.code} />
          </Link>
          <Text size="sm" c="dimmed" truncate>
            {r.openedByName} · {formatDate(r.closedAt)}
          </Text>
        </Group>
      ),
    }))
  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }} spacing="md" mb="lg">
        <StatTile
          label={<InfoLabel info={METRIC_INFO.shiftsClosed}>Ca đã đóng</InfoLabel>}
          value={formatNumber(shifts.closed)}
        />
        <StatTile
          label={<InfoLabel info={METRIC_INFO.shiftDiff}>Ca thiếu</InfoLabel>}
          value={formatNumber(shifts.short)}
        />
        <StatTile label="Ca thừa" value={formatNumber(shifts.over)} />
        <StatTile label="Tổng chênh lệch" value={<Money value={shifts.differenceTotal} />} />
        <StatTile
          label={<InfoLabel info={METRIC_INFO.shiftCashTotal}>Tổng tiền nộp</InfoLabel>}
          value={<Money value={shifts.handInTotal} />}
        />
      </SimpleGrid>
      {diffItems.length > 0 && (
        <Card mb="lg">
          <Title order={5} mb="md">
            <InfoLabel info={METRIC_INFO.shiftDiff}>Chênh lệch theo ca</InfoLabel>
          </Title>
          <BarList items={diffItems} />
        </Card>
      )}
    </>
  )
}
