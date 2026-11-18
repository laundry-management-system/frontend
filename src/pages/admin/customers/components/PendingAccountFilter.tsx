import { Badge, Checkbox, Group, Text } from '@mantine/core'
import { usePendingRegistrationCount } from '@/features/admin/customers'
import { usePendingAccountParam } from './usePendingAccountParam'

export function PendingAccountFilter() {
  const { pendingOnly, togglePending } = usePendingAccountParam()
  const pendingCount = usePendingRegistrationCount().data ?? 0
  return (
    <Checkbox.Card
      checked={pendingOnly}
      onClick={togglePending}
      radius="md"
      w="auto"
      px="md"
      h="var(--ds-control-height-md)"
      bg={pendingOnly ? 'var(--ds-accent)' : undefined}
      style={{ borderColor: pendingOnly ? 'var(--ds-primary)' : 'var(--ds-border)' }}
    >
      <Group gap="xs" wrap="nowrap" h="100%">
        <Checkbox.Indicator size="sm" />
        <Text size="sm" fw={500} c={pendingOnly ? 'var(--ds-accent-foreground)' : undefined}>
          Chờ duyệt tài khoản
        </Text>
        {pendingCount > 0 && (
          <Badge size="sm" circle variant="filled" color="danger">
            {pendingCount}
          </Badge>
        )}
      </Group>
    </Checkbox.Card>
  )
}
