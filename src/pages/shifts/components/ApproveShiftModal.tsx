import { Button, Modal, Stack, Textarea } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { useApproveShift } from '@/features/shifts'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { EntityCode, InfoLabel, ModalFooter } from '@/shared/ui'

const NOTE_MAX = 500
const APPROVE_INFO = 'Ca được duyệt không sửa được nữa. Thao tác được ghi nhật ký hệ thống.'

interface ApproveShiftModalProps {
  opened: boolean
  onClose: () => void
  shiftId: number
  code: string
}

/** Duyệt ca kèm ghi chú (không bắt buộc). Mount khi mở để ghi chú luôn bắt đầu trống. */
export function ApproveShiftModal({ opened, onClose, shiftId, code }: ApproveShiftModalProps) {
  const title = (
    <>
      Duyệt ca <EntityCode code={code} />
    </>
  )
  return (
    <Modal opened={opened} onClose={onClose} centered title={title}>
      {opened && <ApproveForm onClose={onClose} shiftId={shiftId} code={code} />}
    </Modal>
  )
}

function ApproveForm({ onClose, shiftId, code }: Omit<ApproveShiftModalProps, 'opened'>) {
  const approve = useApproveShift(shiftId)
  const [note, setNote] = useState('')

  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.currentTarget.value)
  const submit = () =>
    approve.mutate(note, {
      onSuccess: () => {
        notify.success(`Đã duyệt ca ${code}`)
        onClose()
      },
      onError: (err) => notify.error(toApiError(err).message),
    })

  return (
    <>
      <Stack gap="sm">
        <Textarea
          label={<InfoLabel info={APPROVE_INFO}>Ghi chú duyệt</InfoLabel>}
          placeholder="VD: đã nhắc NV kiểm tra tiền thối"
          autosize
          minRows={3}
          maxLength={NOTE_MAX}
          data-autofocus
          value={note}
          onChange={handleNoteChange}
        />
      </Stack>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Quay lại
        </Button>
        <Button onClick={submit} loading={approve.isPending}>
          Duyệt ca
        </Button>
      </ModalFooter>
    </>
  )
}
