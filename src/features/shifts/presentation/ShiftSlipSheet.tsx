import { Divider, Group, Stack, Text, type TextProps } from '@mantine/core'
import type { ReactNode } from 'react'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { EntityCode } from '@/shared/ui'
import { differenceLabel } from '../domain/closing'
import type { ShiftDetail } from '../domain/types'

// Cỡ chữ đặt bằng prop: class `text-print-*` bị font-size mặc định của Mantine Text đè
const BODY: TextProps = { fz: 12, lh: '16px' }
const SMALL: TextProps = { fz: 11, lh: '14px', c: 'dimmed' }
const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
const DOUBLE_RULE = {
  borderTop: '3px double var(--ds-border)',
  borderBottom: '3px double var(--ds-border)',
}

const dateTime = (iso: string | null) => (iso ? formatDateTime(iso).slice(0, 16) : '')
const signed = (v: number) =>
  v < 0 ? `−${formatMoney(-v)}` : v > 0 ? `+${formatMoney(v)}` : formatMoney(0)

function Row({
  label,
  strong,
  children,
}: {
  label: string
  strong?: boolean
  children: ReactNode
}) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="xs" align="flex-start">
      <Text
        {...BODY}
        c={strong ? undefined : 'dimmed'}
        fw={strong ? 700 : undefined}
        style={{ flexShrink: 0 }}
      >
        {label}
      </Text>
      <Text
        {...BODY}
        fw={strong ? 700 : undefined}
        ta="right"
        component="div"
        style={{ ...TABULAR, overflowWrap: 'anywhere' }}
      >
        {children}
      </Text>
    </Group>
  )
}

/** Phiếu kết ca (BM15) khổ giấy in nhiệt 80 mm: bằng chứng bàn giao tiền, nhân viên ký và kẹp cùng tiền nộp. */
export function ShiftSlipSheet({ shift: s }: { shift: ShiftDetail }) {
  const denominations = Object.entries(s.denominations ?? {})
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((a, b) => b.value - a.value)
  const keepNotes = Object.entries(s.keepDenominations ?? {})
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((a, b) => b.value - a.value)
  const onBehalf = s.closedById != null && s.closedById !== s.openedById

  return (
    <Stack gap={4} p="sm">
      <Stack gap={0} align="center">
        <Text fz={13} fw={700} lh="18px">
          PHIẾU KẾT CA
        </Text>
        <EntityCode code={s.code} size="sm" />
      </Stack>

      <Divider variant="dashed" my={4} />
      <Row label="Nhân viên phụ trách">{s.openedByName}</Row>
      <Row label="Mở ca lúc">{dateTime(s.openedAt)}</Row>
      <Row label="Kết ca lúc">{dateTime(s.closedAt)}</Row>
      {onBehalf && (
        <>
          <Row label="Kết ca thay">{s.closedByName}</Row>
          <Text {...SMALL}>Lý do: {s.closeOnBehalfReason}</Text>
        </>
      )}

      <Divider variant="dashed" my={4} />
      <Row label="Tiền đầu ca">{formatMoney(s.openingCash)}</Row>
      <Row label={`Tiền mặt đã thu (${s.cashInCount} GD)`}>{signed(s.cashIn)}</Row>
      <Row label={`Tiền mặt đã hoàn trả (${s.cashOutCount} GD)`}>{signed(-s.cashOut)}</Row>
      <Row label="TIỀN MẶT DỰ KIẾN" strong>
        {formatMoney(s.expectedCash)}
      </Row>
      <Row label="TIỀN MẶT THỰC ĐẾM" strong>
        {formatMoney(s.countedCash ?? 0)}
      </Row>
      <Row label="CHÊNH LỆCH" strong>
        {signed(s.difference ?? 0)}
      </Row>
      {(s.difference ?? 0) !== 0 && (
        <Text {...SMALL}>
          {differenceLabel(s.difference ?? 0)}. Lý do: {s.differenceReason}
        </Text>
      )}

      {denominations.length > 0 && (
        <>
          <Divider variant="dashed" my={4} />
          {denominations.map((d) => (
            <Row key={d.value} label={`${formatMoney(d.value)} × ${d.count}`}>
              {formatMoney(d.value * d.count)}
            </Row>
          ))}
        </>
      )}

      <Divider variant="dashed" my={4} />
      <Row label={`Chuyển khoản (${s.transferCount} GD)`}>{formatMoney(s.transferTotal)}</Row>
      <Row label="Đã đối chiếu app ngân hàng">{s.bankReconciled ? 'Có' : 'Chưa'}</Row>
      {(s.transferDifference ?? 0) !== 0 && (
        <>
          <Row label="Trong app ngân hàng">{formatMoney(s.bankTotal ?? 0)}</Row>
          <Row label="LỆCH CHUYỂN KHOẢN" strong>
            {signed(s.transferDifference ?? 0)}
          </Row>
          <Text {...SMALL}>Lý do: {s.transferDifferenceReason}</Text>
        </>
      )}
      <Row label="Tiền để lại két">{formatMoney(s.keepCash ?? 0)}</Row>
      {keepNotes.length > 0 && (
        <Text {...SMALL}>
          Gồm {keepNotes.map((d) => `${d.count} × ${formatMoney(d.value)}`).join(', ')}
        </Text>
      )}
      <Group justify="space-between" wrap="nowrap" py={4} style={DOUBLE_RULE}>
        <Text fz={13} fw={700}>
          NỘP CHỦ TIỆM
        </Text>
        <Text fz={15} fw={700} style={TABULAR}>
          {formatMoney(s.handInCash ?? 0)}
        </Text>
      </Group>

      {s.approvedAt && (
        <>
          <Row label="Admin duyệt">{s.approvedByName}</Row>
          <Row label="Ngày duyệt">{dateTime(s.approvedAt)}</Row>
          {s.approvalNote && <Text {...SMALL}>Ghi chú: {s.approvalNote}</Text>}
        </>
      )}

      <Group justify="space-between" mt="md" mb={48}>
        <Text {...SMALL}>Nhân viên ký</Text>
        <Text {...SMALL}>Người nhận tiền ký</Text>
      </Group>
    </Stack>
  )
}

/** Vùng in: chỉ hiện khi in, ẩn trên màn hình */
export function ShiftSlipPrintArea({ shift }: { shift: ShiftDetail | null }) {
  if (!shift) return null
  return (
    <Stack className="print-area" maw={320}>
      <ShiftSlipSheet shift={shift} />
    </Stack>
  )
}
