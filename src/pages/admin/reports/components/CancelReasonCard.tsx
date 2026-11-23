import { Button, Card, Group, Title } from '@mantine/core'
import { LuChartPie, LuDownload } from 'react-icons/lu'
import { METRIC_INFO, ShareRing } from '@/features/admin/reports'
import { EmptyState, InfoLabel } from '@/shared/admin/ui'
import { formatNumber } from '@/shared/common/lib/format'

type Reason = { code: string; label: string; count: number }

interface CancelReasonCardProps {
  reasons: Reason[]
  onExport: () => void
}

export function CancelReasonCard({ reasons, onExport }: CancelReasonCardProps) {
  const sum = reasons.reduce((s, r) => s + r.count, 0)
  const items = reasons.map((r) => ({
    key: r.code,
    label: r.label,
    value: r.count,
    detail: formatNumber(r.count),
  }))
  return (
    <Card style={{ flex: '1 1 420px', minWidth: 0 }}>
      <Group justify="space-between" mb="md">
        <Title order={5}>
          <InfoLabel info={METRIC_INFO.cancelByReason}>Đơn hủy theo lý do</InfoLabel>
        </Title>
        <Button
          variant="default"
          size="xs"
          leftSection={<LuDownload size={14} />}
          disabled={sum === 0}
          onClick={onExport}
        >
          Xuất CSV
        </Button>
      </Group>
      {sum === 0 ? (
        <EmptyState
          icon={<LuChartPie size={32} />}
          title="Chưa có đơn hủy trong kỳ"
          description="Phân bổ đơn hủy theo lý do sẽ hiện ở đây."
        />
      ) : (
        <ShareRing
          items={items}
          centerLabel="Đơn hủy"
          centerValue={formatNumber(sum)}
          size={160}
          thickness={18}
        />
      )}
    </Card>
  )
}
