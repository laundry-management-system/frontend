import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { OrderCode } from '@/shared/ui'
import { UNIT_LABEL } from '@/features/services'
import type { ReceiptData } from '../../domain/types'

interface ReceiptSheetProps {
  data: ReceiptData
  /** SVG mã QR tra cứu; không có thì vẽ ô giữ chỗ (bản xem trước) */
  qrSvg?: string | null
  copies?: 1 | 2
}

const COPY_LABEL = ['Liên 1 – Khách giữ', 'Liên 2 – Kẹp túi đồ']

const formatDue = (iso: string) => (iso ? formatDateTime(iso).slice(0, 16) : '—')

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="xs">
      <Text className="text-print-small">{label}</Text>
      <Text className="text-print-body" fw={600} ta="right">
        {value}
      </Text>
    </Group>
  )
}

function Services({ data }: { data: ReceiptData }) {
  if (!data.services?.length)
    return (
      <Text className="text-print-small" c="dimmed">
        Chưa chọn dịch vụ
      </Text>
    )
  return (
    <Stack gap={4}>
      <Text className="text-print-small">Dịch vụ đã chọn (giá tham khảo)</Text>
      {data.services.map((s) => {
        const unit = UNIT_LABEL[s.unit]
        const surcharge = s.expressSurcharge ? ` + ${formatMoney(s.expressSurcharge)}` : ''
        return (
          <Group key={s.name} justify="space-between" wrap="nowrap" gap="xs" align="flex-start">
            <Text className="text-print-body">{s.name}</Text>
            <Stack gap={0} align="flex-end">
              <Text className="text-print-body" style={{ whiteSpace: 'nowrap' }}>
                {`${formatMoney(s.unitPrice)}${surcharge}/${unit}`}
              </Text>
              {s.minQuantity > 0 && (
                <Text className="text-print-small" c="dimmed">
                  {`tối thiểu ${s.minQuantity} ${unit}`}
                </Text>
              )}
            </Stack>
          </Group>
        )
      })}
    </Stack>
  )
}

function Copy({ data, qrSvg, label }: { data: ReceiptData; qrSvg?: string | null; label: string }) {
  const express = data.orderType === 'EXPRESS'
  const multi = (data.intakeOrderCount ?? 1) > 1
  return (
    <Stack
      gap={6}
      p="md"
      bg="var(--ds-card)"
      style={{
        border: '1px dashed var(--ds-border)',
        borderRadius: 'var(--radius-control)',
        breakInside: 'avoid',
      }}
    >
      <Stack gap={0} align="center">
        <Text className="text-print-title">{data.shopName}</Text>
        {data.hotline && <Text className="text-print-small">Hotline {data.hotline}</Text>}
        <Text className="text-print-title">PHIẾU NHẬN ĐỒ</Text>
        <Text className="text-print-small">{label}</Text>
      </Stack>
      <Divider variant="dashed" />
      <Stack gap={2} align="center">
        <OrderCode code={data.orderCode} />
        {data.orderType && (
          <Badge size="sm" radius="xs" color="dark" variant={express ? 'filled' : 'outline'}>
            {express ? 'GIẶT NHANH' : 'TIÊU CHUẨN'}
          </Badge>
        )}
        <Text className="text-print-small">Nhận lúc {formatDue(data.receivedAt)}</Text>
        {multi && data.intakeCode && (
          <Text className="text-print-small">
            {`Lượt nhận ${data.intakeCode} · phiếu ${data.intakeOrderIndex}/${data.intakeOrderCount}`}
          </Text>
        )}
      </Stack>
      <Divider variant="dashed" />
      <Row label="Khách hàng" value={data.customerName || '—'} />
      <Row label="Số điện thoại" value={data.customerPhone || '—'} />
      <Row label="Ngày hẹn trả" value={formatDue(data.dueAt)} />
      <Divider variant="dashed" />
      <Services data={data} />
      {data.washWhitesSeparately && (
        <Text
          className="text-print-body"
          fw={600}
          px={8}
          py={4}
          style={{
            borderLeft: '3px solid var(--tone-warning-border)',
            background: 'var(--tone-warning-bg)',
          }}
        >
          {`Giặt riêng đồ trắng · +${formatMoney(data.whitesFee ?? 0)}`}
        </Text>
      )}
      <Divider variant="dashed" />
      <Stack gap={4} align="center">
        {qrSvg ? (
          // SVG do thư viện qrcode sinh từ URL tra cứu, không chứa nội dung người dùng nhập
          <Box w={96} h={96} dangerouslySetInnerHTML={{ __html: qrSvg }} />
        ) : (
          <Box w={96} h={96} style={{ border: '1px dashed var(--ds-border)' }} />
        )}
        <Text className="text-print-small" ta="center">
          Quét để xem chi tiết đơn và giá
        </Text>
      </Stack>
      <Text className="text-print-small" ta="center">
        Khối lượng và tổng tiền sẽ được tiệm cập nhật sau khi phân loại, cân đồ; khách xem qua mã QR
        hoặc tin nhắn Zalo.
      </Text>
      <Text className="text-print-small" c="dimmed">
        Điều khoản: bồi thường tối đa 5 lần giá dịch vụ của món hư hỏng/thất lạc. Lưu đồ tối đa 30
        ngày kể từ ngày hẹn.
      </Text>
      <Group justify="space-between" pt="xs" pb="lg">
        <Text className="text-print-small">Nhân viên ký</Text>
        <Text className="text-print-small">Khách hàng ký</Text>
      </Group>
    </Stack>
  )
}

/** Phiếu nhận đồ BM3 v3: dùng cho xem trước ở WF-C01. */
export function ReceiptSheet({ data, qrSvg, copies = 2 }: ReceiptSheetProps) {
  return (
    <Stack gap="md">
      {COPY_LABEL.slice(0, copies).map((label) => (
        <Copy key={label} data={data} qrSvg={qrSvg} label={label} />
      ))}
    </Stack>
  )
}

/** Vùng in (ẩn trên màn hình): mỗi đơn 2 liên, theo thứ tự đơn. */
export function ReceiptPrintArea({
  receipts,
}: {
  receipts: { data: ReceiptData; qrSvg: string }[]
}) {
  if (!receipts.length) return null
  return (
    <Stack gap="md" className="print-area" maw={320}>
      {receipts.map((r) => (
        <ReceiptSheet key={r.data.orderCode} data={r.data} qrSvg={r.qrSvg} />
      ))}
    </Stack>
  )
}
