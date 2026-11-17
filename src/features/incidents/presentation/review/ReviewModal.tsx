import { Box, Button, Group, Modal, Select, Stack, Text, Textarea } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { type ChangeEvent, useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { formatMoney } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter, MoneyInput } from '@/shared/ui'
import { useApproveIncident } from '../../application/mutations/useApproveIncident'
import { useRejectIncident } from '../../application/mutations/useRejectIncident'
import { amountError, isOverLimit, previewSettlement } from '../../domain/rules'
import type { IncidentFormValues, IncidentOrderBlock, IncidentResolution } from '../../domain/types'
import { RESOLUTION_OPTIONS, renderResolutionOption } from '../form/resolutionOptions'

const BOX_STYLE = {
  background: 'var(--mantine-color-gray-0)',
  borderRadius: 'var(--mantine-radius-sm)',
}

function settlementNote(order: IncidentOrderBlock) {
  if (order.paymentStatus === 'PAID') return 'Đơn đã thanh toán: toàn bộ số tiền chi trả cho khách.'
  const voucher =
    order.discountAmount > 0
      ? `, voucher ${formatMoney(order.discountAmount)}`
      : ', chưa có voucher'
  return `Đơn chưa thanh toán: tiền hàng ${formatMoney(order.subtotal)}${voucher}.`
}

/** Modal duyệt của Admin: phương án / số tiền dùng chung form của phiếu, đóng thì trả lại giá trị đề xuất. */
export function ReviewModal({
  incidentId,
  incidentCode,
  opened,
  onClose,
  form,
  order,
  max,
  lineTotal,
  onConflict,
}: {
  incidentId: number
  incidentCode: string
  opened: boolean
  onClose: () => void
  form: UseFormReturnType<IncidentFormValues>
  order: IncidentOrderBlock
  max: number
  lineTotal: number | null
  onConflict: () => void
}) {
  const approve = useApproveIncident()
  const reject = useRejectIncident()
  const [note, setNote] = useState('')
  const [overLimitReason, setOverLimitReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState(false)

  const { resolution } = form.values
  const amount = typeof form.values.amount === 'number' ? form.values.amount : 0
  const over = isOverLimit(resolution, amount, max)
  const settlement = previewSettlement(resolution === 'REWASH' ? 0 : amount, order)

  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.currentTarget.value)
  const handleReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setOverLimitReason(e.currentTarget.value)
    setReasonError(null)
  }
  const handleResolutionChange = (value: string | null) => {
    form.setFieldValue('resolution', value as IncidentResolution | null)
    if (value === 'REWASH') form.setFieldValue('amount', 0)
  }
  const openReject = () => setRejecting(true)
  const closeReject = () => setRejecting(false)

  const handleError = (e: unknown) => {
    const err = toApiError(e)
    if (err.status === 409) onConflict()
    const fieldErrors = err.fieldErrors ?? {}
    if (fieldErrors.overLimitReason) setReasonError(fieldErrors.overLimitReason)
    if (fieldErrors.amount) form.setFieldError('amount', fieldErrors.amount)
    if (fieldErrors.resolution) form.setFieldError('resolution', fieldErrors.resolution)
    notify.error(err.message)
  }

  const handleApprove = () => {
    // Form chặn vượt mức cho Nhân viên; Admin được duyệt vượt kèm lý do
    const { errors } = form.validate()
    if (over) form.clearFieldError('amount')
    if (Object.keys(errors).some((k) => !(over && k === 'amount'))) return
    if (!resolution) return notify.error('Chọn phương án xử lý')
    const amountProblem = amountError(resolution, form.values.amount, lineTotal, max, {
      allowOverLimit: true,
    })
    if (amountProblem) return form.setFieldError('amount', amountProblem)
    if (over && !overLimitReason.trim()) return setReasonError('Nhập lý do duyệt vượt mức')
    approve.mutate(
      {
        id: incidentId,
        dto: {
          resolution,
          amount: resolution === 'REWASH' ? 0 : amount,
          note: note.trim() || null,
          overLimitReason: over ? overLimitReason.trim() : null,
        },
      },
      {
        onSuccess: () => {
          notify.success('Đã duyệt phiếu sự cố')
          onClose()
        },
        onError: handleError,
      },
    )
  }

  const confirmReject = (reason?: string) =>
    reject.mutate(
      { id: incidentId, note: reason ?? '' },
      {
        onSuccess: () => {
          closeReject()
          notify.success('Đã từ chối phiếu sự cố')
          onClose()
        },
        onError: (e) => {
          closeReject()
          handleError(e)
        },
      },
    )

  const title = (
    <InfoLabel info="Phiếu không tự đổi trạng thái đơn. Giặt lại thì lùi trạng thái đơn; duyệt và từ chối đều được ghi nhật ký.">
      <Group gap={6} component="span">
        Duyệt phiếu <EntityCode code={incidentCode} />
      </Group>
    </InfoLabel>
  )

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="md">
      <Stack gap="md">
        <Select
          label="Phương án duyệt"
          required
          data={RESOLUTION_OPTIONS}
          value={resolution}
          onChange={handleResolutionChange}
          error={form.errors.resolution}
          renderOption={renderResolutionOption}
        />
        {resolution !== 'REWASH' && (
          <MoneyInput label="Số tiền duyệt" min={0} {...form.getInputProps('amount')} />
        )}
        <Textarea
          label="Ghi chú duyệt"
          autosize
          minRows={2}
          maxLength={500}
          value={note}
          onChange={handleNoteChange}
        />
        {over && (
          <Textarea
            label="Lý do duyệt vượt mức"
            required
            autosize
            minRows={2}
            maxLength={500}
            value={overLimitReason}
            onChange={handleReasonChange}
            error={reasonError}
          />
        )}
        <Box p="md" style={BOX_STYLE}>
          <Stack gap={6}>
            <Text size="sm" fw={600}>
              Xem trước – Sau khi duyệt
            </Text>
            <Group justify="space-between">
              <Text size="sm">Trừ vào đơn (giảm giá sự cố)</Text>
              <Text size="sm">{formatMoney(settlement.deducted)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Cần chi cho khách</Text>
              <Text size="sm" fw={600}>
                {formatMoney(settlement.payoutDue)}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {settlementNote(order)}
            </Text>
          </Stack>
        </Box>
        <ModalFooter>
          <Button
            variant="secondary"
            color="danger"
            mr="auto"
            onClick={openReject}
            disabled={approve.isPending}
          >
            Từ chối
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleApprove} loading={approve.isPending}>
            Duyệt
          </Button>
        </ModalFooter>
        <ConfirmModal
          opened={rejecting}
          onClose={closeReject}
          onConfirm={confirmReject}
          kind="reason"
          title="Từ chối phiếu sự cố"
          confirmLabel="Từ chối"
          loading={reject.isPending}
        >
          Đơn không thay đổi. Lý do từ chối được lưu trên phiếu và ghi nhật ký.
        </ConfirmModal>
      </Stack>
    </Modal>
  )
}
