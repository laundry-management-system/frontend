import { Button, Modal, Stack, Textarea } from '@mantine/core'
import { useState, type ReactNode } from 'react'
import { ModalFooter } from './ModalFooter'

interface ConfirmModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  /** confirm: xác nhận thường · destructive: hủy/xóa · reason: bắt buộc nhập lý do (ghi nhật ký) */
  kind: 'confirm' | 'destructive' | 'reason'
  title: string
  children?: ReactNode
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  kind,
  title,
  children,
  confirmLabel = 'Xác nhận',
  loading,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()

  const close = () => {
    setReason('')
    onClose()
  }

  return (
    <Modal opened={opened} onClose={close} title={title} centered>
      <Stack>
        {children && <div className="text-body-md text-muted-foreground">{children}</div>}
        {kind === 'reason' && (
          <Textarea
            label="Lý do"
            required
            autosize
            minRows={3}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={close}>
            Quay lại
          </Button>
          <Button
            color={kind === 'destructive' ? 'danger' : undefined}
            disabled={kind === 'reason' && !trimmed}
            loading={loading}
            onClick={() => onConfirm(kind === 'reason' ? trimmed : undefined)}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  )
}
