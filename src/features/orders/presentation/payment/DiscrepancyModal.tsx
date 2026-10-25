import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { InfoLabel, ModalFooter, Money, MoneyInput } from '@/shared/ui'
import { useRecordDiscrepancy } from '../../application/mutations/useRecordDiscrepancy'
import { discrepancySchema, type DiscrepancyValues } from '../../application/schemas'
import { discrepancyOf } from '../../domain/payment'
import type { OrderDetail } from '../../domain/types'

const NOTE_MAX = 500

/** Khách chuyển thiếu/thừa: ghi vào ghi chú đơn, đơn vẫn chưa thanh toán. Mount khi mở. */
export function DiscrepancyModal({ order, onClose }: { order: OrderDetail; onClose: () => void }) {
  const expected = order.totalAmount
  const record = useRecordDiscrepancy()
  const form = useForm<DiscrepancyValues>({
    initialValues: { receivedAmount: '', note: '' },
    validate: schemaResolver(discrepancySchema(expected), { sync: true }),
    validateInputOnChange: true,
  })
  const { receivedAmount, note } = form.values
  const diff = receivedAmount === '' ? null : discrepancyOf(expected, receivedAmount)
  const valid = discrepancySchema(expected).safeParse(form.values).success

  const submit = form.onSubmit((v) =>
    record.mutate(
      { orderCode: order.orderCode, receivedAmount: Number(v.receivedAmount), note: v.note },
      {
        onSuccess: () => {
          notify.success('Đã ghi nhận chênh lệch')
          onClose()
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    ),
  )

  const diffText = !diff ? null : diff.kind === 'none' ? (
    <Text c="dimmed">Không có chênh lệch</Text>
  ) : (
    <Text c={diff.kind === 'short' ? 'danger' : 'warning'} fw={600}>
      Khách chuyển {diff.kind === 'short' ? 'thiếu' : 'thừa'} <Money value={diff.diff} />
    </Text>
  )

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <InfoLabel info="Đơn vẫn chưa thanh toán. Xử lý phần chênh rồi mới xác nhận đã thu">
          Khách chuyển sai số tiền
        </InfoLabel>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          <Group justify="space-between">
            <Text c="dimmed">Số tiền phải thu</Text>
            <Text fw={600}>
              <Money value={expected} />
            </Text>
          </Group>
          <MoneyInput
            label="Số tiền đã nhận"
            required
            data-autofocus
            {...form.getInputProps('receivedAmount')}
          />
          {diffText}
          <Textarea
            label="Ghi chú chênh lệch"
            required
            autosize
            minRows={2}
            maxLength={NOTE_MAX}
            description={`${note.length}/${NOTE_MAX}`}
            {...form.getInputProps('note')}
          />
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Quay lại
            </Button>
            <Button type="submit" disabled={!valid} loading={record.isPending}>
              Lưu ghi nhận
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
