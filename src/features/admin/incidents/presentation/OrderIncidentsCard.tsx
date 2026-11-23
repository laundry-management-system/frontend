import { Button, Card, Group, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuCloudOff, LuPlus } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { formatDateTime } from '@/shared/common/lib/format'
import { CopyableCode, EmptyState, FieldGrid, Money, StatusBadge } from '@/shared/admin/ui'
import { useIncidents } from '../application/queries/useIncidents'
import { payoutState } from '../domain/rules'
import { INCIDENT_TYPE_LABEL, RESOLUTION_LABEL, type IncidentSummary } from '../domain/types'
import { PATHS } from '@/shared/common/config/paths'

/** Các dòng nhãn/giá trị của một sự cố; dòng không có giá trị thì bỏ. */
function fieldsOf(i: IncidentSummary): [string, ReactNode | false | null][] {
  const rows: [string, ReactNode | false | null][] = [
    ['Loại sự cố', INCIDENT_TYPE_LABEL[i.type]],
    ['Phương án', i.resolution ? RESOLUTION_LABEL[i.resolution] : ''],
    [
      'Số tiền',
      <Text key="amount" span inherit fw={700}>
        <Money value={i.amount} />
      </Text>,
    ],
    [
      'Trừ vào đơn',
      i.deductedAmount > 0 && i.deductedAmount !== i.amount && <Money value={i.deductedAmount} />,
    ],
    ['Cần chi', payoutState(i) === 'due' && <Money value={i.payoutDue} />],
    ['Duyệt lúc', i.reviewedAt ? formatDateTime(i.reviewedAt).slice(0, 16) : ''],
    ['Người duyệt', i.reviewedBy ?? ''],
  ]
  return rows
}

export function OrderIncidentsCard({
  orderId,
  cancelled,
}: {
  orderId: number
  cancelled: boolean
}) {
  const navigate = useNavigate()
  const { data, isError, refetch } = useIncidents({ orderId, page: 0, size: 50 })
  const incidents = data?.content ?? []
  const createIncident = () => navigate(`${PATHS.incidentNew}?orderId=${orderId}`)
  const handleRetry = () => refetch()

  const list = incidents.map((i) => (
    <Card
      key={i.id}
      withBorder
      role="link"
      tabIndex={0}
      aria-label={`Xem sự cố ${i.code}`}
      className="ds-focus ds-card-link"
      onClick={() => navigate(PATHS.incidentDetail(i.id))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) navigate(PATHS.incidentDetail(i.id))
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <CopyableCode code={i.code} />
          <Group gap="sm" wrap="nowrap">
            <StatusBadge group="incident" statusKey={i.status} size="sm" />
          </Group>
        </Group>
        <FieldGrid rows={fieldsOf(i)} />
      </Stack>
    </Card>
  ))

  const retryAction = (
    <Button variant="default" size="xs" onClick={handleRetry}>
      Thử lại
    </Button>
  )
  const empty = isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được sự cố"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={retryAction}
    />
  ) : (
    <Text size="sm" c="dimmed">
      Chưa có sự cố.
    </Text>
  )

  return (
    <Stack gap="md">
      {!cancelled && (
        <Group justify="flex-end">
          <Button variant="secondary" leftSection={<LuPlus size={16} />} onClick={createIncident}>
            Lập phiếu sự cố
          </Button>
        </Group>
      )}
      {incidents.length ? <Stack gap="sm">{list}</Stack> : empty}
    </Stack>
  )
}
