import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { LuArrowRight } from 'react-icons/lu'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ModalFooter, StatusBadge } from '@/shared/admin/ui'
import { useChangeMachineStatus } from '../application/useChangeMachineStatus'
import { isStaleMachineError, MACHINE_LIMITS, machineErrorMessage } from '../domain/rules'
import type { Machine, MachineStatus } from '../domain/types'

export interface StatusChange {
  machine: Machine
  target: MachineStatus
}

interface MachineStatusModalProps {
  change: StatusChange | null
  onClose: () => void
}

function titleOf({ machine, target }: StatusChange) {
  if (target === 'RETIRED') return `Ngừng sử dụng ${machine.name}`
  if (target === 'MAINTENANCE') return `Chuyển ${machine.name} sang Bảo trì`
  return machine.status === 'RETIRED'
    ? `Kích hoạt lại ${machine.name}`
    : `Đánh dấu ${machine.name} Sẵn sàng`
}

export function MachineStatusModal({ change, onClose }: MachineStatusModalProps) {
  return (
    <Modal opened={!!change} onClose={onClose} centered title={change && titleOf(change)}>
      {change && <StatusForm change={change} onClose={onClose} />}
    </Modal>
  )
}

function StatusForm({ change, onClose }: { change: StatusChange; onClose: () => void }) {
  const { machine, target } = change
  const [reason, setReason] = useState('')
  const mutation = useChangeMachineStatus()
  const retiring = target === 'RETIRED'

  const handleReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setReason(e.currentTarget.value)

  const submit = () =>
    mutation.mutate(
      { id: machine.id, status: target, reason },
      {
        onSuccess: (m) => {
          notify.success(`Đã cập nhật trạng thái máy ${m.code}`)
          onClose()
        },
        onError: (err) => {
          const error = toApiError(err)
          if (error.status !== 403) notify.error(machineErrorMessage(error))
          if (isStaleMachineError(error)) onClose()
        },
      },
    )

  return (
    <Stack>
      <Group gap="xs">
        <StatusBadge group="machine" statusKey={machine.status.toLowerCase()} />
        <LuArrowRight size={16} />
        <StatusBadge group="machine" statusKey={target.toLowerCase()} />
      </Group>
      {retiring && <Text size="sm">Máy không bị xóa. Chỉ Admin kích hoạt lại được.</Text>}
      <Textarea
        label="Lý do"
        placeholder="Không bắt buộc"
        autosize
        minRows={2}
        maxLength={MACHINE_LIMITS.reason}
        description={`Còn ${MACHINE_LIMITS.reason - reason.length} ký tự`}
        value={reason}
        onChange={handleReasonChange}
        data-autofocus
      />
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
          Hủy
        </Button>
        <Button
          color={retiring ? 'danger' : undefined}
          loading={mutation.isPending}
          onClick={submit}
        >
          {retiring ? 'Ngừng sử dụng' : 'Xác nhận'}
        </Button>
      </ModalFooter>
    </Stack>
  )
}
