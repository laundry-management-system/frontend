import { Divider, Group, Stack, Text, type TextProps } from '@mantine/core'
import type { ReactNode } from 'react'
import { formatPhone } from '@/features/customers'
import { UNIT_LABEL } from '@/features/services'
import { formatDateTime, formatMoney, formatNumber } from '@/shared/lib/format'
import { EntityCode } from '@/shared/ui'
import type { Invoice } from '../../domain/types'

const METHOD_LABEL = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản (QR)' } as const

// Cỡ chữ đặt bằng prop: class `text-print-*` bị font-size mặc định của Mantine Text đè
const BODY: TextProps = { fz: 12, lh: '16px' }
const SMALL: TextProps = { fz: 11, lh: '14px', c: 'dimmed' }
const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

const dateTime = (iso: string) => formatDateTime(iso).slice(0, 16)

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="xs" align="flex-start">
      <Text {...BODY} c="dimmed" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text {...BODY} ta="right" component="div" style={{ ...TABULAR, overflowWrap: 'anywhere' }}>
        {children}
      </Text>
    </Group>
  )
}

/** Hóa đơn thanh toán (BM9) khổ giấy in nhiệt, cùng khổ với phiếu nhận đồ. */
export function InvoiceSheet({ invoice: inv }: { invoice: Invoice }) {
  const receiver = inv.receiver
    ? inv.receiver.name
      ? `${inv.receiver.name}${inv.receiver.relation ? ` (${inv.receiver.relation})` : ''}`
      : 'Khách hàng'
    : null
  const adjustments = [
    { label: 'Giảm giá', value: -inv.discountAmount },
    { label: 'Phụ phí giặt nhanh', value: inv.expressFee },
    { label: 'Giặt riêng đồ trắng', value: inv.whitesFee },
  ].filter((a) => a.value !== 0)

  return (
    <Stack gap={4} p="sm">
      <Stack gap={0} align="center">
        <Text fz={14} fw={700} lh="18px" ta="center">
          {inv.shopName}
        </Text>
        {inv.hotline && <Text {...SMALL}>Hotline {inv.hotline}</Text>}
        <Text fz={13} fw={700} lh="18px" mt={6}>
          HÓA ĐƠN THANH TOÁN
        </Text>
        <EntityCode code={inv.invoiceNo} size="sm" />
        <Text {...SMALL}>{dateTime(inv.paidAt)}</Text>
      </Stack>

      <Divider variant="dashed" my={4} />
      <Row label="Mã đơn">
        <EntityCode code={inv.orderCode} size="sm" />
      </Row>
      <Row label="Khách hàng">{inv.customerName}</Row>
      <Row label="SĐT">{formatPhone(inv.customerPhone)}</Row>
      <Row label="Ngày nhận đồ">{dateTime(inv.receivedAt)}</Row>
      <Row label="Nhân viên">{inv.confirmedByName}</Row>

      <Divider variant="dashed" my={4} />
      {inv.lines.map((l) => (
        <Stack key={l.index} gap={0}>
          <Text {...BODY} style={{ overflowWrap: 'anywhere' }}>
            {l.name}
          </Text>
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Text {...SMALL} style={TABULAR}>
              {formatNumber(l.quantity)} {UNIT_LABEL[l.unit]} × {formatMoney(l.unitPrice)}
            </Text>
            <Text {...BODY} style={TABULAR}>
              {formatMoney(l.lineTotal)}
            </Text>
          </Group>
        </Stack>
      ))}

      <Divider variant="dashed" my={4} />
      {adjustments.length > 0 && (
        <>
          <Row label="Tổng tiền hàng">{formatMoney(inv.subtotal)}</Row>
          {adjustments.map((a) => (
            <Row key={a.label} label={a.label}>
              {a.value < 0 ? `−${formatMoney(-a.value)}` : `+${formatMoney(a.value)}`}
            </Row>
          ))}
        </>
      )}
      <Group
        justify="space-between"
        wrap="nowrap"
        py={4}
        style={{
          borderTop: '3px double var(--ds-border)',
          borderBottom: '3px double var(--ds-border)',
        }}
      >
        <Text fz={13} fw={700}>
          TỔNG THANH TOÁN
        </Text>
        <Text fz={15} fw={700} style={TABULAR}>
          {formatMoney(inv.totalAmount)}
        </Text>
      </Group>
      <Row label="Thanh toán">{METHOD_LABEL[inv.method]}</Row>
      {inv.referenceCode && <Row label="Mã tham chiếu">{inv.referenceCode}</Row>}
      {inv.cash && (
        <>
          <Row label="Tiền khách đưa">{formatMoney(inv.cash.given)}</Row>
          <Row label="Tiền thối">{formatMoney(inv.cash.change)}</Row>
        </>
      )}

      {receiver && (
        <>
          <Divider variant="dashed" my={4} />
          <Row label="Người nhận">{receiver}</Row>
        </>
      )}
      <Text {...SMALL} ta="center" mt={8}>
        Cảm ơn quý khách!
      </Text>
    </Stack>
  )
}

export function InvoicePrintArea({ invoice }: { invoice: Invoice | null }) {
  if (!invoice) return null
  return (
    <Stack className="print-area" maw={320}>
      <InvoiceSheet invoice={invoice} />
    </Stack>
  )
}
