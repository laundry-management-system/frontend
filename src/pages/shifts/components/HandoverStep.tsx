import { Group, Stack, Text, Textarea } from '@mantine/core'
import { DenominationTable } from '@/features/shifts'
import { formatMoney } from '@/shared/lib/format'
import { InfoLabel } from '@/shared/ui'
import { useShiftReconcileContext } from '../ShiftReconcileContext'
import { StepCard } from './StepCard'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
const BOXED = { borderRadius: 'var(--radius-control)', border: '1px solid var(--ds-border)' }
const KEEP_INFO =
  'Chọn tờ tiền giữ lại trong két làm tiền lẻ cho ca sau; tổng này là tiền đầu ca gợi ý của ca sau. Còn lại nộp chủ tiệm.'

/** Bước 3: số tờ để lại két cho ca sau, phần còn lại nộp chủ tiệm */
export function HandoverStep() {
  const {
    editable,
    shift,
    form,
    countsInput,
    keepCounts,
    keepCash,
    counted,
    handInAmount,
    onBehalf,
    done,
    changeKeep,
  } = useShiftReconcileContext()

  const keepBlock = editable ? (
    <>
      <InfoLabel info={KEEP_INFO}>
        <Text size="sm" fw={500} span>
          Số tờ để lại két cho ca sau
        </Text>
      </InfoLabel>
      <DenominationTable
        counts={keepCounts}
        onChange={changeKeep}
        max={countsInput}
        totalLabel="Để lại két"
      />
    </>
  ) : shift.keepDenominations ? (
    <DenominationTable counts={keepCounts} readOnly totalLabel="Để lại két" />
  ) : (
    <Group justify="space-between">
      <Text fw={600}>Để lại két</Text>
      <Text fw={700} size="xl" style={TABULAR}>
        {formatMoney(keepCash)}
      </Text>
    </Group>
  )

  return (
    <StepCard step={3} title="Bàn giao tiền" done={done.handover}>
      {counted === null ? (
        <Text size="sm" c="dimmed">
          Đếm tiền mặt ở bước 1 trước, rồi chọn số tờ để lại két cho ca sau.
        </Text>
      ) : (
        <>
          {keepBlock}
          <Group justify="space-between" p="sm" style={BOXED}>
            <Stack gap={0}>
              <Text fw={700}>Nộp chủ tiệm</Text>
              <Text size="xs" c="dimmed">
                = Thực đếm − Để lại két
              </Text>
            </Stack>
            <Text fw={700} size="xl" style={TABULAR}>
              {handInAmount === null ? '' : formatMoney(handInAmount)}
            </Text>
          </Group>
        </>
      )}
      {editable && onBehalf && (
        <Textarea
          label="Lý do kết ca thay"
          required
          autosize
          minRows={2}
          maxLength={255}
          {...form.getInputProps('closeOnBehalfReason')}
        />
      )}
    </StepCard>
  )
}
