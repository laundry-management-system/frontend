import { SimpleGrid, Text, Textarea } from '@mantine/core'
import { DenominationTable, differenceLabel, toneOf } from '@/features/admin/shifts'
import { formatMoney } from '@/shared/common/lib/format'
import { InfoLabel } from '@/shared/admin/ui'
import { useShiftReconcileContext } from '../ShiftReconcileContext'
import { CompareCell } from './CompareCell'
import { ReasonText } from './ReasonText'
import { StepCard } from './StepCard'

const EXPECTED_INFO = 'Dự kiến = Tiền đầu ca + Đã thu − Đã hoàn trả và chi bồi thường trong ca.'

/** Bước 1: đếm tiền mặt theo mệnh giá, so với dự kiến */
export function CashStep() {
  const { editable, shift, form, counts, counted, diff, differenceReason, done, changeCounts } =
    useShiftReconcileContext()

  const reason =
    diff !== null &&
    diff !== 0 &&
    (editable ? (
      <Textarea
        label="Lý do chênh lệch"
        required
        autosize
        minRows={2}
        maxLength={255}
        placeholder="VD: thối nhầm 20.000đ cho khách đơn LD-…"
        {...form.getInputProps('differenceReason')}
      />
    ) : (
      <ReasonText label="Lý do chênh lệch" text={differenceReason} />
    ))

  return (
    <StepCard step={1} title="Đếm tiền mặt trong két" done={done.cash}>
      {editable || shift.denominations ? (
        <DenominationTable counts={counts} onChange={changeCounts} readOnly={!editable} />
      ) : (
        <Text size="sm" c="dimmed">
          Ca này không lưu số tờ theo mệnh giá.
        </Text>
      )}
      <SimpleGrid cols={3} spacing="xs">
        <CompareCell
          label={<InfoLabel info={EXPECTED_INFO}>Dự kiến</InfoLabel>}
          value={formatMoney(shift.expectedCash)}
        />
        <CompareCell label="Thực đếm" value={counted === null ? '' : formatMoney(counted)} />
        <CompareCell
          label="Chênh lệch"
          value={diff === null ? '' : differenceLabel(diff)}
          tone={toneOf(diff)}
        />
      </SimpleGrid>
      {reason}
    </StepCard>
  )
}
