import { Button, Center, Text } from '@mantine/core'
import { LuCheck, LuRotateCcw, LuTriangleAlert } from 'react-icons/lu'
import { allowedTransitions } from '../domain/rules'
import type { Machine, MachineStatus } from '../domain/types'

interface MachineStatusActionProps {
  machine: Machine
  canManage: boolean
  onChange: (machine: Machine, target: MachineStatus) => void
}

/** Nút đổi trạng thái chính của một máy, dùng chung cho thẻ và hồ sơ. */
export function MachineStatusAction({ machine, canManage, onChange }: MachineStatusActionProps) {
  const allowed = allowedTransitions(machine.status, canManage)
  const toMaintenance = () => onChange(machine, 'MAINTENANCE')
  const toReady = () => onChange(machine, 'READY')

  if (machine.status === 'READY' && allowed.includes('MAINTENANCE'))
    return (
      <Button
        variant="light"
        color="warning"
        fullWidth
        leftSection={<LuTriangleAlert size={16} />}
        onClick={toMaintenance}
      >
        Chuyển sang Bảo trì
      </Button>
    )
  if (machine.status === 'MAINTENANCE')
    return (
      <Button fullWidth leftSection={<LuCheck size={16} />} onClick={toReady}>
        Đánh dấu Sẵn sàng
      </Button>
    )
  if (allowed.includes('READY'))
    return (
      <Button
        variant="secondary"
        fullWidth
        leftSection={<LuRotateCcw size={16} />}
        onClick={toReady}
      >
        Kích hoạt lại
      </Button>
    )
  return (
    <Center h={36}>
      <Text size="sm" c="dimmed">
        Chỉ Admin kích hoạt lại
      </Text>
    </Center>
  )
}
