import { Card, Group, SimpleGrid, Title } from '@mantine/core'
import { INCIDENT_TYPE_LABEL, type IncidentType } from '@/features/admin/incidents'
import {
  METRIC_INFO,
  type OperationsReport,
  OrdersLine,
  ShareRing,
  periodDelta,
  type ReportMode,
} from '@/features/admin/reports'
import { EmptyState, InfoLabel, Money, StatTile } from '@/shared/admin/ui'
import { formatNumber } from '@/shared/common/lib/format'

type Count = { label: string; count: number }

const EMPTY = <EmptyState title="Chưa có sự cố trong kỳ" />

function IncidentTypeCard({ rows }: { rows: Count[] }) {
  return (
    <Card style={{ flex: '1 1 320px', minWidth: 0 }}>
      <Title order={5} mb="md">
        Theo loại
      </Title>
      {rows.some((r) => r.count > 0) ? (
        <ShareRing
          items={rows.map((r) => ({
            key: r.label,
            label: r.label,
            value: r.count,
            detail: formatNumber(r.count),
          }))}
          centerLabel="Sự cố"
          centerValue={formatNumber(rows.reduce((s, r) => s + r.count, 0))}
        />
      ) : (
        EMPTY
      )}
    </Card>
  )
}

interface IncidentSectionProps {
  report: OperationsReport
  mode: ReportMode
}

export function IncidentSection({ report, mode }: IncidentSectionProps) {
  const { incidents } = report
  const byType = incidents.byType.map((t) => ({
    label: INCIDENT_TYPE_LABEL[t.type as IncidentType] ?? t.type,
    count: t.count,
  }))
  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
        <StatTile
          label={<InfoLabel info={METRIC_INFO.incidents}>Sự cố</InfoLabel>}
          value={formatNumber(incidents.total)}
          {...periodDelta(incidents.total, report.previous.incidentsTotal, true)}
        />
        <StatTile
          label={<InfoLabel info={METRIC_INFO.compensation}>Bồi thường tiền mặt</InfoLabel>}
          value={<Money value={incidents.payouts.cash} />}
        />
        <StatTile
          label="Bồi thường chuyển khoản"
          value={<Money value={incidents.payouts.bankTransfer} />}
        />
      </SimpleGrid>
      <Group align="stretch" gap="lg" wrap="wrap" mb="lg">
        <Card style={{ flex: '2 1 420px', minWidth: 0 }}>
          <Title order={5} mb="md">
            Sự cố theo {mode === 'month' ? 'tháng' : 'ngày'}
          </Title>
          <OrdersLine rows={incidents.rows} mode={mode} label="Sự cố" />
        </Card>
        <IncidentTypeCard rows={byType} />
      </Group>
    </>
  )
}
