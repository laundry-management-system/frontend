import { Box, Button, CopyButton, Modal, SegmentedControl, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { LuCheck, LuCopy } from 'react-icons/lu'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ModalFooter, OrderCode } from '@/shared/ui'
import { useComposeNotification } from '../../application/mutations/useComposeNotification'
import type { NotificationResult, OrderDetail } from '../../domain/types'

interface NotifyModalProps {
  order: OrderDetail
  onClose: () => void
  onNotified: (result: NotificationResult) => void
}

/** Nhắn lại khách (đơn đã Hoàn thành): soạn tin → chép → mở Zalo/SMS. Mount khi mở. */
export function NotifyModal({ order, onClose, onNotified }: NotifyModalProps) {
  const [channel, setChannel] = useState<'ZALO' | 'SMS'>('ZALO')
  const compose = useComposeNotification()
  const result = compose.data

  const open = () =>
    compose.mutate(
      { orderCode: order.orderCode, channel },
      {
        onSuccess: (r) => {
          onNotified(r)
          notify.success('Đã chép tin nhắn – dán vào ứng dụng để gửi')
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    )

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <>
          Nhắn khách · <OrderCode code={order.orderCode} />
        </>
      }
    >
      <Stack>
        <SegmentedControl
          value={channel}
          onChange={(v) => setChannel(v as 'ZALO' | 'SMS')}
          data={[
            { value: 'ZALO', label: 'Zalo' },
            { value: 'SMS', label: 'SMS' },
          ]}
        />
        {result && (
          <Stack gap={6}>
            <Box p="md" bg="var(--ds-muted)" style={{ borderRadius: 8 }}>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {result.message}
              </Text>
            </Box>
            <Text size="sm" c="dimmed">
              Đã nhắn {result.notifyCount} lần
            </Text>
          </Stack>
        )}
        <ModalFooter>
          {result && (
            <CopyButton value={result.message} timeout={1500}>
              {({ copied, copy }) => (
                <Button
                  variant="secondary"
                  leftSection={copied ? <LuCheck size={16} /> : <LuCopy size={16} />}
                  onClick={copy}
                >
                  {copied ? 'Đã chép' : 'Sao chép tin nhắn'}
                </Button>
              )}
            </CopyButton>
          )}
          <Button loading={compose.isPending} onClick={open}>
            Mở {channel === 'ZALO' ? 'Zalo' : 'SMS'}
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  )
}
