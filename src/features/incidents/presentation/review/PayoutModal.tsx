import { Button, Group, Modal, SegmentedControl, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { invalidateShifts, NoShiftBanner, useCurrentShift } from '@/features/shifts'
import { useMe } from '@/features/users'
import { useQueryClient } from '@tanstack/react-query'
import { toApiError } from '@/shared/api/apiError'
import { formatDateTime } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { EntityCode, InfoLabel, ModalFooter, MoneyInput } from '@/shared/ui'
import { usePayoutIncident } from '../../application/mutations/usePayoutIncident'
import { PAYOUT_METHOD_LABEL, type IncidentDetail, type PayoutMethod } from '../../domain/types'

const METHOD_OPTIONS = Object.entries(PAYOUT_METHOD_LABEL).map(([value, label]) => ({
  value,
  label,
}))

export function PayoutModal({
  incident,
  opened,
  onClose,
}: {
  incident: IncidentDetail
  opened: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const payout = usePayoutIncident()
  const { data: shiftState } = useCurrentShift()
  const { data: me } = useMe()
  const [method, setMethod] = useState<PayoutMethod>('CASH')
  const shift = shiftState?.current ?? null

  const handleMethodChange = (v: string) => setMethod(v as PayoutMethod)
  const handleConfirm = () =>
    payout.mutate(
      { id: incident.id, method },
      {
        onSuccess: () => {
          notify.success('Đã ghi nhận chi bồi thường')
          onClose()
        },
        onError: (e) => {
          const err = toApiError(e)
          if (err.status === 409) invalidateShifts(queryClient)
          notify.error(err.message)
        },
      },
    )

  const amountLabel = (
    <InfoLabel info='Bằng đúng "Cần chi" của phiếu, không sửa được.'>Số tiền chi</InfoLabel>
  )
  const shiftLabel = (
    <InfoLabel info="Tiền mặt trừ vào tiền mặt dự kiến của ca; chuyển khoản chỉ hiện trong giao dịch của ca. Không tạo giao dịch thanh toán của đơn, không trừ doanh thu.">
      Ca đang mở
    </InfoLabel>
  )
  const title = (
    <Group gap={6}>
      Ghi nhận chi bồi thường <EntityCode code={incident.code} />
    </Group>
  )

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="md">
      <Stack gap="md">
        <Stack gap={6}>
          <Text size="sm" fw={500}>
            Hình thức chi
          </Text>
          <SegmentedControl
            fullWidth
            data={METHOD_OPTIONS}
            value={method}
            onChange={handleMethodChange}
          />
        </Stack>
        <MoneyInput label={amountLabel} value={incident.payoutDue} readOnly disabled />
        {shift ? (
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {shiftLabel}
            </Text>
            <Group gap={6}>
              <EntityCode code={shift.code} />
              <Text size="sm">
                · {shift.openedByName} · mở {formatDateTime(shift.openedAt).slice(11, 16)}
              </Text>
            </Group>
          </Stack>
        ) : (
          <NoShiftBanner staffName={me?.fullName ?? ''} />
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={!shift} loading={payout.isPending}>
            Xác nhận đã chi
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  )
}
