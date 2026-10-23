import { Button, Modal, Stack, Textarea } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import { useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { OPENING_HOURS } from '@/shared/config/constants'
import { notify } from '@/shared/lib/notify'
import { ModalFooter } from '@/shared/ui'
import { useRescheduleOrder } from '../../application/mutations/useRescheduleOrder'
import { clampToOpeningHours, validateDueAt } from '../../domain/dueDate'

interface RescheduleModalProps {
  orderId: number
  currentDueAt: string
  onClose: () => void
}

/** Đổi ngày hẹn trả sau khi đã in phiếu: bắt buộc lý do (BR-D08). Mount khi mở. */
export function RescheduleModal({ orderId, currentDueAt, onClose }: RescheduleModalProps) {
  const [dueAt, setDueAt] = useState<Date | null>(new Date(currentDueAt))
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const reschedule = useRescheduleOrder()

  const dueError = validateDueAt(dueAt, new Date())
  const reasonError = reason.trim() ? null : 'Vui lòng nhập lý do dời hẹn'

  const submit = () => {
    setSubmitted(true)
    if (dueError || reasonError) return
    reschedule.mutate(
      { orderId, dueAt: dueAt!, reason },
      {
        onSuccess: () => {
          notify.success('Nhớ báo lại ngày hẹn mới cho khách', 'Đã dời ngày hẹn trả')
          onClose()
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    )
  }

  return (
    <Modal opened onClose={onClose} title="Đổi ngày hẹn trả">
      <Stack>
        <DateTimePicker
          label="Ngày hẹn trả mới"
          required
          valueFormat="DD/MM/YYYY · HH:mm"
          minDate={new Date()}
          value={dueAt}
          onChange={(v) =>
            setDueAt(v ? clampToOpeningHours(dayjs(v).toDate(), OPENING_HOURS) : null)
          }
          error={submitted && dueError}
        />
        <Textarea
          label="Lý do"
          required
          autosize
          minRows={2}
          placeholder="VD: có chăn, cần 48 giờ"
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          error={submitted && reasonError}
        />
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button loading={reschedule.isPending} onClick={submit}>
            Lưu ngày hẹn
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  )
}
