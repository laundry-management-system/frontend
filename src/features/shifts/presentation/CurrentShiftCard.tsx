import { Button, Group, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { LuLock } from 'react-icons/lu'
import { EntityCode } from '@/shared/ui'
import type { CurrentShift } from '../domain/types'

// Cùng tông đỏ với nút Kết ca
const CARD = {
  '--live-dot-color': 'var(--tone-danger-solid)',
  border: '1px solid var(--tone-danger-border)',
  background: 'var(--tone-danger-bg)',
  borderRadius: 'var(--radius-control)',
  padding: '3px 3px 3px 10px',
}

interface CurrentShiftCardProps {
  shift: CurrentShift
  /** Người mở ca hoặc Admin: hiện nút Kết ca trong thẻ */
  onClose?: () => void
}

/** Thẻ ca đang mở trên header: chấm "live", mã ca, người giữ két, giờ mở và nút Kết ca. */
export function CurrentShiftCard({ shift, onClose }: CurrentShiftCardProps) {
  return (
    <Group
      gap={10}
      wrap="nowrap"
      style={CARD}
      role="status"
      aria-label={`Ca ${shift.code} đang mở, ${shift.openedByName} giữ két từ ${dayjs(shift.openedAt).format('HH:mm')}`}
    >
      <Group gap={6} wrap="nowrap">
        <span className="ds-live-dot" aria-hidden />
        <Text size="xs" fw={700} c="var(--tone-danger-fg)" tt="uppercase" lts="0.04em">
          Đang mở
        </Text>
      </Group>
      <Group gap={4} wrap="nowrap" c="var(--tone-danger-fg)">
        <EntityCode code={shift.code} size="sm" />
        {/* Màn hẹp: bỏ tên và giờ mở để header không xuống dòng (vẫn có trong aria-label) */}
        <Text size="sm" c="inherit" visibleFrom="lg" style={{ whiteSpace: 'nowrap' }}>
          · <b>{shift.openedByName}</b> · từ {dayjs(shift.openedAt).format('HH:mm')}
        </Text>
      </Group>
      {onClose && (
        <Button
          size="compact-sm"
          color="danger"
          leftSection={<LuLock size={14} />}
          onClick={onClose}
        >
          Kết ca
        </Button>
      )}
    </Group>
  )
}
