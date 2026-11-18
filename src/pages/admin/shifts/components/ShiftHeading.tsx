import { Anchor, Breadcrumbs, Group } from '@mantine/core'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { type ShiftDetail, ShiftStatusBadge } from '@/features/admin/shifts'
import { EntityCode } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

const dateTime = (iso: string | null) => (iso ? dayjs(iso).format('DD/MM HH:mm') : '')

export function ShiftBreadcrumbs({ code }: { code: string }) {
  return (
    <Breadcrumbs mb="xs">
      <Anchor component={Link} to={PATHS.shifts} size="sm">
        Ca làm việc
      </Anchor>
      <EntityCode code={code} size="sm" />
    </Breadcrumbs>
  )
}

export function ShiftTitle({ shift }: { shift: ShiftDetail }) {
  return (
    <Group gap="sm">
      Ca <EntityCode code={shift.code} />
      <ShiftStatusBadge status={shift.status} />
    </Group>
  )
}

export function ShiftDescription({ shift }: { shift: ShiftDetail }) {
  return (
    <>
      {shift.openedByName} · {dateTime(shift.openedAt)}
      {shift.closedAt && ` – ${dateTime(shift.closedAt)}`}
      {shift.closedByName && ` · kết bởi ${shift.closedByName}`}
    </>
  )
}
