import {
  Button,
  Group,
  Modal,
  SegmentedControl,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { schemaResolver, useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { toApiError } from '@/shared/api/apiError'
import { OPENING_HOURS } from '@/shared/config/constants'
import { notify } from '@/shared/lib/notify'
import { InfoLabel, ModalFooter, MoneyInput } from '@/shared/ui'
import {
  adminReasonSchema,
  type AdminMode,
  type AdminReasonValues,
} from '../../application/schemas'
import { useAdjustPrice } from '../../application/mutations/useAdjustPrice'
import { useRescheduleOrder } from '../../application/mutations/useRescheduleOrder'
import { useRevertStatus } from '../../application/mutations/useRevertStatus'
import { clampToOpeningHours } from '../../domain/dueDate'
import { adminActionsOf, previousStatus } from '../../domain/rules'
import { ORDER_STATUS_LABEL, type OrderDetail, type OrderStatus } from '../../domain/types'

const MODES: { value: AdminMode; label: string; action: 'revert' | 'reschedule' | 'price' }[] = [
  { value: 'revert', label: 'Lùi trạng thái', action: 'revert' },
  { value: 'reschedule', label: 'Sửa ngày hẹn', action: 'reschedule' },
  { value: 'price', label: 'Sửa giá đơn', action: 'price' },
]

const SUCCESS: Record<AdminMode, string> = {
  revert: 'Đã lùi trạng thái đơn',
  reschedule: 'Đã dời ngày hẹn trả',
  price: 'Đã sửa tổng tiền đơn',
}

interface AdminReasonModalProps {
  order: OrderDetail
  initialMode: AdminMode
  onClose: () => void
}

/** WF-D04: một modal cho các thao tác Admin cần lý do (BR-D06, BR-D08, BR-D12). Mount khi mở. */
export function AdminReasonModal({ order, initialMode, onClose }: AdminReasonModalProps) {
  const available = adminActionsOf(order)
  const target = previousStatus(order.status)
  const revert = useRevertStatus()
  const reschedule = useRescheduleOrder()
  const price = useAdjustPrice()
  const busy = revert.isPending || reschedule.isPending || price.isPending

  const form = useForm<AdminReasonValues>({
    initialValues: {
      mode: initialMode,
      targetStatus: target,
      dueAt: new Date(order.dueAt),
      newTotalAmount: order.totalAmount,
      reason: '',
    },
    validate: schemaResolver(adminReasonSchema, { sync: true }),
  })
  const mode = form.values.mode

  const done = () => {
    notify.success(SUCCESS[mode])
    onClose()
  }
  const failed = (e: unknown) => notify.error(toApiError(e).message)

  const submit = form.onSubmit((v) => {
    const reason = v.reason
    if (v.mode === 'revert')
      revert.mutate(
        { orderId: order.id, targetStatus: v.targetStatus as OrderStatus, reason },
        { onSuccess: done, onError: failed },
      )
    else if (v.mode === 'reschedule')
      reschedule.mutate(
        { orderId: order.id, dueAt: v.dueAt!, reason },
        { onSuccess: done, onError: failed },
      )
    else
      price.mutate(
        { orderId: order.id, newTotalAmount: Number(v.newTotalAmount), reason },
        { onSuccess: done, onError: failed },
      )
  })

  return (
    <Modal
      opened
      onClose={onClose}
      size={520}
      title={
        <InfoLabel info="Ghi vào lịch sử đơn: người thực hiện, thời gian, dữ liệu cũ → mới, lý do. Không sửa hay xóa được">
          Thao tác cần lý do
        </InfoLabel>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          <SegmentedControl
            fullWidth
            value={mode}
            onChange={(v) => form.setFieldValue('mode', v as AdminMode)}
            data={MODES.map((m) => ({
              value: m.value,
              label: m.label,
              disabled: !available[m.action].enabled,
            }))}
          />
          {mode === 'revert' && (
            <Group grow align="flex-start">
              <TextInput
                label="Trạng thái hiện tại"
                disabled
                value={ORDER_STATUS_LABEL[order.status]}
              />
              <Select
                label="Lùi về"
                required
                data={target ? [{ value: target, label: ORDER_STATUS_LABEL[target] }] : []}
                {...form.getInputProps('targetStatus')}
              />
            </Group>
          )}
          {mode === 'reschedule' && (
            <DateTimePicker
              label="Ngày hẹn trả mới"
              required
              valueFormat="DD/MM/YYYY · HH:mm"
              minDate={new Date()}
              value={form.values.dueAt}
              onChange={(v) =>
                form.setFieldValue(
                  'dueAt',
                  v ? clampToOpeningHours(dayjs(v).toDate(), OPENING_HOURS) : null,
                )
              }
              error={form.errors.dueAt}
            />
          )}
          {mode === 'price' && (
            <MoneyInput label="Tổng tiền mới" required {...form.getInputProps('newTotalAmount')} />
          )}
          <Textarea
            label="Lý do"
            required
            autosize
            minRows={3}
            placeholder="VD: Khách báo còn vết ố – phải giặt lại"
            {...form.getInputProps('reason')}
          />
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={busy}>
              Xác nhận
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
