import { Badge } from '@mantine/core'
import { SHIFT_STATUS_LABEL, type ShiftStatus } from '../domain/types'

const TONE: Record<ShiftStatus, string> = { OPEN: 'success', CLOSED: 'warning', APPROVED: 'info' }

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  return (
    <Badge color={TONE[status]} variant="light">
      {SHIFT_STATUS_LABEL[status]}
    </Badge>
  )
}
