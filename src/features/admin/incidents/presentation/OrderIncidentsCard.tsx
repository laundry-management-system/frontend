import { Button, Card, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { LuCloudOff, LuPlus } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { formatDateTime, formatMoney } from '@/shared/common/lib/format'
import { EmptyState, EntityCode, StatusBadge } from '@/shared/admin/ui'
import { useIncidents } from '../application/queries/useIncidents'
import { payoutState } from '../domain/rules'
import { INCIDENT_TYPE_LABEL, RESOLUTION_LABEL, type IncidentSummary } from '../domain/types'
import { PATHS } from '@/shared/common/config/paths'

const ITEM_STYLE = {
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--mantine-radius-sm)',
  padding: 'var(--mantine-spacing-sm)',
  width: '100%',
}

const summaryOf = (i: IncidentSummary) =>
  [
    INCIDENT_TYPE_LABEL[i.type],
    i.resolution ? RESOLUTION_LABEL[i.resolution] : 'Chưa chọn phương án',
    formatMoney(i.amount),
  ].join(' · ')

function settlementOf(i: IncidentSummary) {
  if (i.status !== 'approved') return null
  const parts = i.deductedAmount > 0 ? [`Trừ vào đơn ${formatMoney(i.deductedAmount)}`] : []
  if (i.reviewedAt)
    parts.push(`duyệt ${formatDateTime(i.reviewedAt).slice(0, 16)} bởi ${i.reviewedBy ?? ''}`)
  if (payoutState(i) === 'due') parts.push(`Cần chi ${formatMoney(i.payoutDue)}`)
  return parts.join(' · ')
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
  const openIncident = (id: number) => navigate(PATHS.incidentDetail(id))
  const createIncident = () => navigate(`${PATHS.incidentNew}?orderId=${orderId}`)
  const handleRetry = () => refetch()

  const list = incidents.map((i) => {
    const settlement = settlementOf(i)
    return (
      <UnstyledButton key={i.id} style={ITEM_STYLE} onClick={() => openIncident(i.id)}>
        <Stack gap={4}>
          <Group justify="space-between">
            <EntityCode code={i.code} />
            <StatusBadge group="incident" statusKey={i.status} size="sm" />
          </Group>
          <Text size="sm">{summaryOf(i)}</Text>
          {settlement && (
            <Text size="xs" c="dimmed">
              {settlement}
            </Text>
          )}
        </Stack>
      </UnstyledButton>
    )
  })

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
    <Card>
      <Stack gap="sm">
        <Title order={5}>Sự cố</Title>
        {incidents.length ? list : empty}
        {!cancelled && (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            leftSection={<LuPlus size={16} />}
            onClick={createIncident}
          >
            Lập phiếu sự cố
          </Button>
        )}
      </Stack>
    </Card>
  )
}
