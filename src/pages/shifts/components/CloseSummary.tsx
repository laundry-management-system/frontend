import { Button, Card, Divider, Group, List, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuCircleAlert, LuLock } from 'react-icons/lu'
import { differenceLabel } from '@/features/shifts'
import { formatMoney } from '@/shared/lib/format'
import { useShiftReconcileContext } from '../ShiftReconcileContext'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
// Dính khi cuộn: header cao 56px + khoảng cách trang
const STICKY = { position: 'sticky', top: 'calc(56px + var(--mantine-spacing-md))' } as const

const DIFF_COLOR = (d: number) =>
  d === 0 ? 'var(--tone-success-fg)' : d < 0 ? 'var(--tone-danger-fg)' : 'var(--tone-warning-fg)'

function Line({
  label,
  value,
  sign,
  strong,
  color,
}: {
  label: ReactNode
  value: string
  sign?: '+' | '−' | '='
  strong?: boolean
  color?: string
}) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="xs">
      <Text size="sm" c={strong ? undefined : 'dimmed'} fw={strong ? 700 : undefined}>
        {label}
      </Text>
      <Text size={strong ? 'md' : 'sm'} fw={strong ? 700 : 500} c={color} style={TABULAR}>
        {sign && sign !== '=' ? `${sign} ` : ''}
        {value}
      </Text>
    </Group>
  )
}

/** Tóm tắt ca bên phải: phép tính tiền mặt từ trên xuống; khi kết ca thêm việc còn thiếu và nút Kết ca. */
export function CloseSummary() {
  const {
    editable,
    shift,
    counted,
    handInAmount: handIn,
    transferDiff,
    missing,
    askConfirm,
  } = useShiftReconcileContext()
  const diff = counted === null ? null : counted - shift.expectedCash
  return (
    <Card style={STICKY}>
      <Stack gap="sm">
        <Text fw={700} size="lg">
          Tóm tắt ca
        </Text>
        <Line label="Tiền đầu ca" value={formatMoney(shift.openingCash)} />
        <Line
          label={`Thu tiền mặt (${shift.cashInCount})`}
          value={formatMoney(shift.cashIn)}
          sign={shift.cashIn ? '+' : undefined}
        />
        <Line
          label={`Tiền mặt đã hoàn trả và chi bồi thường (${shift.cashOutCount})`}
          value={formatMoney(shift.cashOut)}
          sign={shift.cashOut ? '−' : undefined}
        />
        <Divider />
        <Line label="Tiền mặt dự kiến" value={formatMoney(shift.expectedCash)} strong />
        <Line
          label="Tiền mặt thực đếm"
          value={counted === null ? '' : formatMoney(counted)}
          strong
        />
        {diff !== null && (
          <Line label="Chênh lệch" value={differenceLabel(diff)} strong color={DIFF_COLOR(diff)} />
        )}
        <Divider />
        <Line
          label={`Chuyển khoản (${shift.transferCount})`}
          value={formatMoney(shift.transferTotal)}
        />
        {transferDiff !== null && transferDiff !== 0 && (
          <Line
            label="Lệch chuyển khoản"
            value={differenceLabel(transferDiff)}
            strong
            color={DIFF_COLOR(transferDiff)}
          />
        )}
        <Group
          justify="space-between"
          wrap="nowrap"
          p="sm"
          bg="var(--ds-muted)"
          style={{ borderRadius: 'var(--radius-control)' }}
        >
          <Text fw={700}>Nộp chủ tiệm</Text>
          <Text fw={700} size="xl" style={TABULAR}>
            {handIn === null ? '' : formatMoney(handIn)}
          </Text>
        </Group>

        {editable && missing.length > 0 && (
          <Stack gap={4}>
            <Group gap={6} c="var(--tone-warning-fg)">
              <LuCircleAlert size={16} aria-hidden />
              <Text size="sm" fw={600} c="inherit">
                Còn thiếu để kết ca
              </Text>
            </Group>
            <List size="sm" c="dimmed" spacing={2}>
              {missing.map((m) => (
                <List.Item key={m}>{m}</List.Item>
              ))}
            </List>
          </Stack>
        )}
        {editable && (
          <Button
            color="danger"
            size="md"
            leftSection={<LuLock size={16} />}
            disabled={missing.length > 0}
            onClick={askConfirm}
          >
            Kết ca & in phiếu
          </Button>
        )}
      </Stack>
    </Card>
  )
}
