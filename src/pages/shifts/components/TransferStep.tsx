import { Button, Group, SimpleGrid, Textarea } from '@mantine/core'
import { differenceLabel, toneOf } from '@/features/shifts'
import { formatMoney } from '@/shared/lib/format'
import { InfoLabel, MoneyInput } from '@/shared/ui'
import { useShiftReconcileContext } from '../ShiftReconcileContext'
import { CompareCell } from './CompareCell'
import { ReasonText } from './ReasonText'
import { StepCard } from './StepCard'
import { TOGGLE_VARS } from './toggleVars'

const BANK_INFO =
  'Mở ứng dụng ngân hàng của tiệm, cộng tiền về từ lúc mở ca đến giờ rồi nhập vào đây.'

/** Bước 2: so tổng chuyển khoản hệ thống với ứng dụng ngân hàng */
export function TransferStep() {
  const { editable, shift, form, bankTotal, transferDiff, transferReason, done, showTransfers } =
    useShiftReconcileContext()

  const reason =
    transferDiff !== null &&
    transferDiff !== 0 &&
    (editable ? (
      <>
        <Textarea
          label="Lý do lệch chuyển khoản"
          required
          autosize
          minRows={2}
          maxLength={255}
          placeholder="VD: khách chuyển thiếu 5.000đ đơn LD-…, đã báo Admin"
          {...form.getInputProps('transferReason')}
        />
        <Group>
          <Button variant="subtle" vars={TOGGLE_VARS} size="compact-sm" onClick={showTransfers}>
            So từng giao dịch trong ca
          </Button>
        </Group>
      </>
    ) : (
      <ReasonText label="Lý do lệch chuyển khoản" text={transferReason} />
    ))

  return (
    <StepCard step={2} title="Đối chiếu chuyển khoản" done={done.transfer}>
      {editable && (
        <MoneyInput
          label={<InfoLabel info={BANK_INFO}>Tổng tiền về trong ứng dụng ngân hàng</InfoLabel>}
          required
          {...form.getInputProps('bankTotal')}
        />
      )}
      <SimpleGrid cols={3} spacing="xs">
        <CompareCell
          label={`Hệ thống (${shift.transferCount} GD)`}
          value={formatMoney(shift.transferTotal)}
        />
        <CompareCell label="App ngân hàng" value={bankTotal === '' ? '' : formatMoney(bankTotal)} />
        <CompareCell
          label="Chênh lệch"
          value={transferDiff === null ? '' : differenceLabel(transferDiff)}
          tone={toneOf(transferDiff)}
        />
      </SimpleGrid>
      {reason}
    </StepCard>
  )
}
