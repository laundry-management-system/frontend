import { Badge, Group, Stack, Text, Tooltip } from '@mantine/core'
import { LuCheck, LuX } from 'react-icons/lu'
import { StatusBadge } from '@/shared/admin/ui'
import { CUSTOMER_STATUS_LABEL, type Customer, type CustomerStatus } from '../domain/types'

type CellCustomer = Pick<Customer, 'fullName' | 'isVip'> &
  Partial<Pick<Customer, 'hasAccount' | 'pendingRegistrationId'>>

export function AccountTags({ customer }: { customer: CellCustomer }) {
  const verified = !!customer.hasAccount
  if (!verified && !customer.pendingRegistrationId) return null
  const label = verified ? 'Đã duyệt' : 'Chờ duyệt'
  return (
    <Group gap={4} wrap="nowrap">
      <Badge size="sm" variant="light" color="neutral">
        Có tài khoản
      </Badge>
      <Tooltip label={label}>
        <Badge
          size="sm"
          circle
          h={16}
          w={16}
          p={0}
          variant="filled"
          color={verified ? 'success' : 'danger'}
          c="white"
          bd={0}
          aria-label={label}
          role="img"
        >
          {verified ? <LuCheck size={10} aria-hidden /> : <LuX size={10} aria-hidden />}
        </Badge>
      </Tooltip>
    </Group>
  )
}

export function CustomerCell({ customer }: { customer: CellCustomer }) {
  return (
    <Stack gap={4} align="flex-start">
      <AccountTags customer={customer} />
      <Group gap={6} wrap="nowrap">
        <Text fw={600}>{customer.fullName}</Text>
        {customer.isVip && <StatusBadge group="flag" statusKey="vip" size="sm" />}
      </Group>
    </Stack>
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
