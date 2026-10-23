import { Box, Button, Modal, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter, OrderCode } from '@/shared/ui'
import { completeOrderSchema, type CompleteOrderValues } from '../../application/schemas'
import { useCompleteOrder } from '../../application/mutations/useCompleteOrder'
import { useComposeNotification } from '../../application/mutations/useComposeNotification'
import type { NotificationResult, OrderDetail } from '../../domain/types'

const CHANNEL_LABEL = { ZALO: 'Zalo', SMS: 'SMS' } as const

interface CompleteOrderModalProps {
  order: OrderDetail
  onClose: () => void
  onNotified: (result: NotificationResult) => void
}

/** WF-D03: Hoàn thành (bắt buộc vị trí kệ), có thể mở Zalo/SMS báo khách ngay. Mount khi mở. */
export function CompleteOrderModal({ order, onClose, onNotified }: CompleteOrderModalProps) {
  const complete = useCompleteOrder()
  const compose = useComposeNotification()
  const [confirmClose, setConfirmClose] = useState(false)
  const form = useForm<CompleteOrderValues>({
    initialValues: { shelfLocation: '', channel: 'ZALO' },
    validate: schemaResolver(completeOrderSchema, { sync: true }),
  })
  const busy = complete.isPending || compose.isPending

  const submit = (notifyCustomer: boolean) =>
    form.onSubmit(async (values) => {
      try {
        await complete.mutateAsync({ orderId: order.id, shelfLocation: values.shelfLocation })
      } catch (e) {
        return notify.error(toApiError(e).message)
      }
      if (!notifyCustomer) {
        notify.success('Đơn đã chuyển sang Hoàn thành')
        return onClose()
      }
      try {
        const result = await compose.mutateAsync({
          orderCode: order.orderCode,
          channel: values.channel,
        })
        onNotified(result)
        notify.success('Đã chép tin nhắn – dán vào ứng dụng để gửi', 'Đơn đã Hoàn thành')
      } catch (e) {
        notify.error(toApiError(e).message, 'Đã Hoàn thành nhưng chưa mở được ứng dụng nhắn tin')
      }
      onClose()
    })()

  const requestClose = () => (form.isDirty() && !busy ? setConfirmClose(true) : onClose())

  return (
    <>
      <Modal
        opened
        onClose={requestClose}
        size={520}
        title={
          <>
            Hoàn thành đơn <OrderCode code={order.orderCode} />
          </>
        }
      >
        <Stack>
          <TextInput
            label={
              <InfoLabel info="Ghi vị trí kệ để túi đồ, dùng khi khách đến lấy và ở danh sách đồ tồn">
                Vị trí kệ
              </InfoLabel>
            }
            required
            autoFocus
            placeholder="A3"
            {...form.getInputProps('shelfLocation')}
          />
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              <InfoLabel info="Nội dung chính thức do hệ thống soạn sau khi hoàn thành; gồm mã đơn và link tra cứu">
                Tin nhắn soạn sẵn
              </InfoLabel>
            </Text>
            <Box p="md" bg="var(--ds-muted)" style={{ borderRadius: 8 }}>
              <Text size="sm">
                Đơn giặt <EntityCode code={order.orderCode} size="sm" /> của anh/chị đã hoàn thành.
                Anh/chị có thể đến tiệm nhận đồ. Tra cứu: …
              </Text>
            </Box>
          </Stack>
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              <InfoLabel info="Mở ứng dụng theo SĐT khách; nhân viên tự bấm gửi. Thời điểm và số lần nhắn được ghi lại">
                Gửi qua
              </InfoLabel>
            </Text>
            <SegmentedControl
              data={[
                { value: 'ZALO', label: 'Zalo' },
                { value: 'SMS', label: 'SMS' },
              ]}
              {...form.getInputProps('channel')}
            />
          </Stack>
          <ModalFooter>
            <Button variant="secondary" disabled={busy} onClick={() => submit(false)}>
              Hoàn thành, chưa nhắn
            </Button>
            <Button loading={busy} onClick={() => submit(true)}>
              Hoàn thành & mở {CHANNEL_LABEL[form.values.channel]}
            </Button>
          </ModalFooter>
        </Stack>
      </Modal>
      <ConfirmModal
        opened={confirmClose}
        kind="destructive"
        title="Bỏ thay đổi?"
        confirmLabel="Bỏ thay đổi"
        onClose={() => setConfirmClose(false)}
        onConfirm={onClose}
      >
        Vị trí kệ vừa nhập sẽ không được lưu.
      </ConfirmModal>
    </>
  )
}
