import { useState } from 'react'
import dayjs from 'dayjs'
import { z } from 'zod'
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/common/api/apiError'
import { formatDateTime } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { OPENING_HOURS } from '@/shared/admin/config/constants'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import { trackingCodeField } from '../../application/schemas'
import { useCompleteDropoff } from '../../application/mutations/useCompleteDropoff'
import {
  dropoffDueOptions,
  dropoffDueRequest,
  dropoffDueState,
  validateDueAt,
} from '../../domain/dueDate'
import type { DueKey } from '../../domain/intake'
import type { OrderDetail } from '../../domain/types'

const shortTime = (v?: string | Date | null) => (v ? formatDateTime(v).slice(0, 16) : '')

const schema = (pickup: boolean) =>
  z.object({ pickupTrackingCode: pickup ? trackingCodeField : z.string() })

/** Chốt chiều gửi: khách tới đưa đồ / đã lấy đồ từ khách. Mount khi mở. */
export function CompleteDropoffModal({
  order,
  onClose,
  onDone,
}: {
  order: OrderDetail
  onClose: () => void
  /** Gọi sau khi chốt thành công (in phiếu nhận đồ) */
  onDone: () => void
}) {
  const complete = useCompleteDropoff()
  const pickup = order.fulfillment?.dropoffMethod === 'PICKUP'
  const label = pickup ? 'Đã lấy đồ từ khách' : 'Khách đã tới đưa đồ'
  const [now] = useState(() => new Date())
  const { state, minDue } = dropoffDueState(order, now, OPENING_HOURS)
  const editable = state === 'lateMoved'
  const options = dropoffDueOptions(minDue, now, OPENING_HOURS)
  const [dueAt, setDueAt] = useState<Date | null>(minDue)
  const [dueKey, setDueKey] = useState<DueKey>('suggest')
  const [dueError, setDueError] = useState<string | null>(null)
  const pickDue = (key: DueKey, value: Date | null) => {
    setDueKey(key)
    setDueAt(value)
    setDueError(null)
  }
  const form = useForm({
    initialValues: { pickupTrackingCode: order.fulfillment?.pickupTrackingCode ?? '' },
    validate: schemaResolver(schema(pickup), { sync: true }),
  })

  const submit = form.onSubmit((v) => {
    // "Gợi ý" = minDue (có thể đã qua nếu đơn quá hạn) nên chỉ kiểm khi nhân viên tự chọn
    const error = !editable || dueKey === 'suggest' ? null : validateDueAt(dueAt, now, minDue)
    if (error || !dueAt) return setDueError(error)
    complete.mutate(
      {
        orderId: order.id,
        pickupTrackingCode: pickup ? v.pickupTrackingCode : undefined,
        dueAt: editable ? dropoffDueRequest(dueAt, minDue) : null,
      },
      {
        onSuccess: () => {
          notify.success('Đã nhận đồ, đơn chuyển sang Mới nhận')
          onClose()
          onDone()
        },
        onError: (e) => {
          const err = toApiError(e)
          if (err.fieldErrors.dueAt) setDueError(err.fieldErrors.dueAt)
          notify.error(err.message)
        },
      },
    )
  })

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <span>
          {label} · <OrderCode code={order.orderCode} />
        </span>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          <Text size="sm">Đơn chuyển sang Mới nhận và phiếu nhận đồ sẽ được in.</Text>
          {editable ? (
            <>
              <Alert
                color="danger"
                title={`${pickup ? 'Tiệm tới nhận' : 'Khách tới'} trễ giờ hẹn – hạn trả sẽ thay đổi`}
              >
                <Text size="sm">
                  Hạn trả:{' '}
                  <Text span c="dimmed" td="line-through">
                    {shortTime(order.dueAt)}
                  </Text>{' '}
                  →{' '}
                  <Text span c="danger" fw={700}>
                    {shortTime(dueAt ?? minDue)}
                  </Text>
                </Text>
              </Alert>
              <DateTimePicker
                label="Hạn trả"
                required
                valueFormat="DD/MM/YYYY · HH:mm"
                minDate={minDue}
                value={dueAt}
                onChange={(v) => pickDue('custom', v ? dayjs(v).toDate() : null)}
                error={dueError}
              />
              <Group gap="xs">
                {options.map((o) => (
                  <Button
                    key={o.key}
                    size="xs"
                    variant={dueKey === o.key ? 'filled' : 'secondary'}
                    onClick={() => pickDue(o.key, o.date)}
                  >
                    {o.label}
                  </Button>
                ))}
              </Group>
            </>
          ) : (
            <Text size="sm">Hạn trả: {shortTime(order.dueAt)} (giữ nguyên)</Text>
          )}
          {pickup && (
            <TextInput
              label="Mã vận đơn chặng lấy"
              data-autofocus
              {...form.getInputProps('pickupTrackingCode')}
            />
          )}
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Quay lại
            </Button>
            <Button type="submit" loading={complete.isPending}>
              Xác nhận & in phiếu
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
