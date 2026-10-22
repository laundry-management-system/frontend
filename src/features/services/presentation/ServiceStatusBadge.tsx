import { Badge } from '@mantine/core'
import { SERVICE_STATUS_LABEL, type ServiceStatus } from '../domain/types'

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <Badge color={status === 'ACTIVE' ? 'success' : 'neutral'} variant="light">
      {SERVICE_STATUS_LABEL[status]}
    </Badge>
  )
}
