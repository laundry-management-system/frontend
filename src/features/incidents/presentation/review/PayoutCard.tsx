import { Alert, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { EntityCode, InfoLabel } from '@/shared/ui'
import { payoutState } from '../../domain/rules'
import { PAYOUT_METHOD_LABEL, type IncidentDetail } from '../../domain/types'
import { PayoutModal } from './PayoutModal'

export function PayoutCard({ incident, isAdmin }: { incident: IncidentDetail; isAdmin: boolean }) {
  const [opened, setOpened] = useState(false)
  const open = () => setOpened(true)
  const close = () => setOpened(false)
  const state = payoutState(incident)

  const title = (
    <InfoLabel info="Khoản chi không tạo giao dịch thanh toán của đơn và không trừ doanh thu.">
      Chi trả
    </InfoLabel>
  )
  const paidTitle = `Đã chi ${formatMoney(incident.payoutAmount ?? incident.payoutDue)} · ${
    incident.payoutMethod ? PAYOUT_METHOD_LABEL[incident.payoutMethod] : ''
  }`

  return (
    <Card>
      <Stack gap="sm">
        <Title order={5}>{title}</Title>
        <Group justify="space-between">
          <Text size="sm">Trừ vào đơn (giảm giá sự cố)</Text>
          <Text size="sm">{formatMoney(incident.deductedAmount)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            Cần chi cho khách
          </Text>
          <Text fw={700}>{formatMoney(incident.payoutDue)}</Text>
        </Group>
        {state === 'paid' && (
          <Alert color="green" title={paidTitle}>
            <Group gap={6}>
              <Text size="sm">
                {incident.paidAt ? formatDateTime(incident.paidAt).slice(0, 16) : ''} · ca
              </Text>
              {incident.payoutShiftCode && <EntityCode code={incident.payoutShiftCode} size="sm" />}
              <Text size="sm">· {incident.paidBy}</Text>
            </Group>
          </Alert>
        )}
        {state === 'due' && isAdmin && (
          <Button size="md" fullWidth onClick={open}>
            Ghi nhận chi bồi thường
          </Button>
        )}
      </Stack>
      {state === 'due' && isAdmin && (
        <PayoutModal incident={incident} opened={opened} onClose={close} />
      )}
    </Card>
  )
}
