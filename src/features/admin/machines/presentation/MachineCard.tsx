import { Badge, Box, Card, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { formatNumber } from '@/shared/common/lib/format'
import { CopyableCode, StatusBadge } from '@/shared/admin/ui'
import { warrantyInfo } from '../domain/rules'
import { type Machine, MACHINE_TYPE_LABEL } from '../domain/types'
import { type MachineFact, MachineFacts } from './MachineFacts'
import { MachinePhoto } from './MachinePhoto'

interface MachineCardProps {
  machine: Machine
  actions?: ReactNode
  menu?: ReactNode
  onOpen?: () => void
}

const THUMB_SIZE = 88
const RETIRED_STYLE = { opacity: 0.65 } as const
const HEADER_STYLE = { flex: 1, minWidth: 0 } as const
const THUMB_STYLE = { flexShrink: 0 } as const
const BODY_STYLE = { flex: 1 } as const

export function MachineCard({ machine, actions, menu, onOpen }: MachineCardProps) {
  const retired = machine.status === 'RETIRED'
  const warranty = warrantyInfo(machine.warrantyUntil, dayjs().format('YYYY-MM-DD'))
  const expiringDays = !retired && warranty?.kind === 'expiring' ? warranty.daysLeft : null

  const facts: MachineFact[] = [
    ['Hãng', machine.brand],
    ['Công suất', `${formatNumber(machine.capacityKg)} kg`],
    ['Model', machine.model],
    ['Vị trí', machine.location],
  ]

  // Ảnh và tên mở hồ sơ; mã có nút sao chép riêng nên nằm ngoài để không lồng nút
  const photo = (
    <Box w={THUMB_SIZE} style={THUMB_STYLE}>
      <MachinePhoto machine={machine} ratio={1} iconSize={32} radius="var(--radius-control)" />
    </Box>
  )
  const name = (
    <Text fw={600} lineClamp={2} title={machine.name}>
      {machine.name}
    </Text>
  )

  return (
    <Card withBorder padding="md" h="100%" style={retired ? RETIRED_STYLE : undefined}>
      <Group gap="sm" wrap="nowrap" align="flex-start">
        {onOpen ? (
          <UnstyledButton onClick={onOpen} tabIndex={-1} aria-hidden>
            {photo}
          </UnstyledButton>
        ) : (
          photo
        )}
        <Stack gap={6} style={HEADER_STYLE}>
          {onOpen ? (
            <UnstyledButton onClick={onOpen} aria-label={`Xem hồ sơ ${machine.name}`}>
              {name}
            </UnstyledButton>
          ) : (
            name
          )}
          <Group gap={6} wrap="nowrap">
            <CopyableCode code={machine.code} size="sm" />
            <Text size="xs" c="dimmed">
              {MACHINE_TYPE_LABEL[machine.type]}
            </Text>
          </Group>
          <StatusBadge group="machine" statusKey={machine.status.toLowerCase()} />
        </Stack>
        {menu}
      </Group>

      <Stack gap="xs" mt="md" style={BODY_STYLE}>
        <MachineFacts facts={facts} />
        {expiringDays != null && (
          <Badge color="warning" variant="light" w="fit-content">
            {expiringDays === 0
              ? 'Hết bảo hành hôm nay'
              : `Sắp hết bảo hành · còn ${expiringDays} ngày`}
          </Badge>
        )}
      </Stack>

      {actions && (
        <Card.Section withBorder inheritPadding py="sm" mt="md">
          {actions}
        </Card.Section>
      )}
    </Card>
  )
}
