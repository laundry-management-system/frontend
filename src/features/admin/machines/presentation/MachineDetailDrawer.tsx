import { Anchor, Badge, Button, Drawer, Group, Stack, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { LuPencil } from 'react-icons/lu'
import { formatDate, formatDateTime, formatNumber } from '@/shared/common/lib/format'
import { CopyableCode, EntityCode, StatusBadge } from '@/shared/admin/ui'
import { warrantyInfo } from '../domain/rules'
import { type Machine, MACHINE_TYPE_LABEL } from '../domain/types'
import { type MachineFact, MachineFacts } from './MachineFacts'
import { MachinePhoto } from './MachinePhoto'

interface MachineDetailDrawerProps {
  machine: Machine | null
  onClose: () => void
  actions?: ReactNode
  onEdit?: () => void
}

function warrantyBadge(m: Machine) {
  const info = warrantyInfo(m.warrantyUntil, dayjs().format('YYYY-MM-DD'))
  if (!info || !m.warrantyUntil) return null
  const until = formatDate(m.warrantyUntil)
  if (info.kind === 'expired')
    return <Badge color="neutral" variant="light">{`Hết bảo hành từ ${until}`}</Badge>
  if (info.kind === 'expiring' && m.status !== 'RETIRED')
    return (
      <Badge color="warning" variant="light">
        {`Sắp hết bảo hành · còn ${info.daysLeft} ngày`}
      </Badge>
    )
  return <Badge color="success" variant="light">{`Còn bảo hành đến ${until}`}</Badge>
}

export function MachineDetailDrawer({
  machine,
  onClose,
  actions,
  onEdit,
}: MachineDetailDrawerProps) {
  const narrow = useMediaQuery('(max-width: 48em)')
  return (
    <Drawer
      opened={!!machine}
      onClose={onClose}
      position="right"
      size={narrow ? '100%' : 'md'}
      title={
        machine && (
          <Group gap="xs">
            <Text fw={600}>{machine.name}</Text>
            <CopyableCode code={machine.code} size="sm" />
          </Group>
        )
      }
    >
      {machine && <MachineDetail machine={machine} actions={actions} onEdit={onEdit} />}
    </Drawer>
  )
}

function MachineDetail({
  machine: m,
  actions,
  onEdit,
}: Omit<MachineDetailDrawerProps, 'onClose' | 'machine'> & { machine: Machine }) {
  const facts: MachineFact[] = [
    ['Loại máy', MACHINE_TYPE_LABEL[m.type]],
    ['Công suất', `${formatNumber(m.capacityKg)} kg`],
    ['Hãng máy', m.brand],
    ['Model', m.model],
    ['Số serial', m.serialNumber && <EntityCode code={m.serialNumber} size="sm" />],
    ['Vị trí', m.location],
    ['Ngày mua', m.purchaseDate && formatDate(m.purchaseDate)],
    ['Hết hạn bảo hành', m.warrantyUntil && formatDate(m.warrantyUntil)],
    ['Ghi chú', m.note, true],
    ['Cập nhật lúc', formatDateTime(m.updatedAt)],
  ]

  const photo = m.image ? (
    <Anchor href={m.image.url} target="_blank" rel="noopener" aria-label="Mở ảnh gốc">
      <MachinePhoto machine={m} radius="var(--radius-control)" />
    </Anchor>
  ) : (
    <MachinePhoto machine={m} radius="var(--radius-control)" />
  )

  return (
    <Stack>
      {photo}
      <Group gap="xs">
        <StatusBadge group="machine" statusKey={m.status.toLowerCase()} />
        {warrantyBadge(m)}
      </Group>
      <MachineFacts facts={facts} />
      {actions}
      {onEdit && (
        <Button variant="secondary" leftSection={<LuPencil size={16} />} onClick={onEdit}>
          Sửa thông tin
        </Button>
      )}
    </Stack>
  )
}
