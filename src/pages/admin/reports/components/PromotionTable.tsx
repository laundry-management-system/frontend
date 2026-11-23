import { Button, Card, Group, Text, Title } from '@mantine/core'
import { LuDownload, LuTicketPercent } from 'react-icons/lu'
import { BarList, capRows, METRIC_INFO, type VoucherRow } from '@/features/admin/reports'
import { CopyableCode, EmptyState, InfoLabel, Money } from '@/shared/admin/ui'
import { formatNumber } from '@/shared/common/lib/format'
import { CapNotice } from './CapNotice'

const EMPTY = (
  <EmptyState
    icon={<LuTicketPercent size={32} />}
    title="Chưa có đơn áp voucher trong kỳ"
    description="Hiệu quả từng voucher sẽ hiện ở đây."
  />
)

export function PromotionTable({ rows, onExport }: { rows: VoucherRow[]; onExport: () => void }) {
  const { shown, truncated } = capRows(rows)
  const items = shown.map((r) => ({
    key: r.voucherCode,
    value: r.revenue,
    display: <Money value={r.revenue} />,
    label: (
      <Group gap="sm" wrap="nowrap">
        <CopyableCode code={r.voucherCode} />
        <Text size="sm" c="dimmed" truncate>
          {formatNumber(r.uses)} lượt · giảm <Money value={r.discountTotal} />
        </Text>
      </Group>
    ),
  }))
  return (
    <Card>
      <Group justify="space-between" mb="md">
        <Title order={5}>
          <InfoLabel info={METRIC_INFO.voucher}>Theo voucher</InfoLabel>
        </Title>
        <Button
          variant="default"
          size="xs"
          leftSection={<LuDownload size={14} />}
          disabled={rows.length === 0}
          onClick={onExport}
        >
          Xuất CSV
        </Button>
      </Group>
      {rows.length === 0 ? EMPTY : <BarList items={items} />}
      <CapNotice truncated={truncated} />
    </Card>
  )
}
