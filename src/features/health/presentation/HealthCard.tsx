import { Alert, Badge, Card, Group, Loader, Stack, Text } from '@mantine/core'
import { formatDateTime } from '@/shared/lib/format'
import { useHealth } from '../application/useHealth'
import { isHealthy } from '../domain/rules'
import type { HealthStatus } from '../domain/types'

const StatusBadge = ({ status }: { status: HealthStatus }) => (
  <Badge color={status === 'UP' ? 'green' : 'red'} variant="light">
    {status}
  </Badge>
)

export function HealthCard({ refetchInterval }: { refetchInterval: number | false }) {
  const { data, error, isPending } = useHealth(refetchInterval)

  if (isPending) return <Loader />
  if (error)
    return (
      <Alert color="red" title="Không gọi được API">
        {error.message}
      </Alert>
    )

  return (
    <Card withBorder padding="lg" maw={420}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>Trạng thái hệ thống</Text>
          <StatusBadge status={isHealthy(data) ? 'UP' : 'DOWN'} />
        </Group>
        <Group justify="space-between">
          <Text>API</Text>
          <StatusBadge status={data.api} />
        </Group>
        <Group justify="space-between">
          <Text>Database</Text>
          <StatusBadge status={data.database} />
        </Group>
        <Text size="sm" c="dimmed">
          Kiểm tra lúc {formatDateTime(data.checkedAt)}
        </Text>
      </Stack>
    </Card>
  )
}
