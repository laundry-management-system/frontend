import { Anchor, Card, Group, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import { formatDateTime, formatMoney } from '@/shared/common/lib/format'
import { RESOLUTION_LABEL, type IncidentDetail } from '../../domain/types'
import { PATHS } from '@/shared/common/config/paths'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" ta="right">
        {value}
      </Text>
    </Group>
  )
}

export function ReviewResultCard({ incident }: { incident: IncidentDetail }) {
  const approved = incident.status === 'approved'
  const reviewer = `${incident.reviewedBy ?? '—'} · ${incident.reviewedAt ? formatDateTime(incident.reviewedAt).slice(0, 16) : ''}`
  const orderLink = PATHS.orderDetail(incident.orderId)
  const rewashOnCompleted =
    approved && incident.resolution === 'REWASH' && incident.order.status === 'COMPLETED'

  return (
    <Card>
      <Stack gap="sm">
        <Title order={5}>{approved ? 'Kết quả duyệt' : 'Đã từ chối'}</Title>
        <Row
          label="Phương án"
          value={incident.resolution ? RESOLUTION_LABEL[incident.resolution] : '—'}
        />
        <Row
          label={approved ? 'Số tiền được duyệt' : 'Số tiền đề xuất'}
          value={formatMoney(incident.amount)}
        />
        <Row label={approved ? 'Người duyệt' : 'Người từ chối'} value={reviewer} />
        {incident.reviewNote && (
          <Text size="sm">
            {approved ? 'Ghi chú' : 'Lý do'}: {incident.reviewNote}
          </Text>
        )}
        {incident.overLimitReason && (
          <Text size="sm">Lý do duyệt vượt mức: {incident.overLimitReason}</Text>
        )}
        {rewashOnCompleted && (
          <Text size="sm">
            Đơn đã hoàn thành: cần{' '}
            <Anchor component={Link} to={orderLink}>
              lùi trạng thái về Đang xử lý
            </Anchor>{' '}
            để giặt lại.
          </Text>
        )}
        {approved && !rewashOnCompleted && (
          <Anchor component={Link} to={orderLink} size="sm">
            Xem đơn
          </Anchor>
        )}
      </Stack>
    </Card>
  )
}
