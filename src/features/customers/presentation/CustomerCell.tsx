import { Badge, Group, Text } from '@mantine/core'
import { StatusBadge } from '@/shared/ui'
import { CUSTOMER_STATUS_LABEL, type Customer, type CustomerStatus } from '../domain/types'

export function CustomerCell({ customer }: { customer: Pick<Customer, 'fullName' | 'isVip'> }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Text fw={600}>{customer.fullName}</Text>
      {customer.isVip && <StatusBadge group="flag" statusKey="vip" size="sm" />}
    </Group>
  )
}

export function CustomerStatusText({ status }: { status: CustomerStatus }) {
  return status === 'ACTIVE' ? (
    <Badge color="success" variant="light">
      {CUSTOMER_STATUS_LABEL.ACTIVE}
    </Badge>
  ) : (
    <Badge color="neutral" variant="light">
      {CUSTOMER_STATUS_LABEL.INACTIVE}
    </Badge>
  )
}
