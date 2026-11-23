import { Alert, Badge, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { formatDateTime, formatMoney, formatPhone } from '@/shared/common/lib/format'
import { CopyableCode } from '@/shared/admin/ui'
import {
  DROPOFF_METHOD_LABEL,
  DROPOFF_STATUS_LABEL,
  RETURN_METHOD_LABEL,
  RETURN_STATUS_LABEL,
  type OrderDetail,
} from '../../domain/types'

const fee = (v: number) => (v === 0 ? 'Miễn phí' : formatMoney(v))
const dateTime = (iso: string) => formatDateTime(iso).slice(0, 16)

const joinAddress = (detail?: string | null, area?: string | null) =>
  [detail, area].filter(Boolean).join(', ')

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Group gap="sm" wrap="nowrap" align="baseline">
      <Text size="sm" c="dimmed" w={88} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" fw={500} component="div" style={{ minWidth: 0 }}>
        {children}
      </Text>
    </Group>
  )
}

interface LegProps {
  title: string
  method: string
  status?: string | null
  timeLabel: string
  time?: ReactNode
  addressLabel: string
  address?: string | null
  feeLabel?: string
  feeValue?: string | null
  trackingCode?: string | null
}

/** Một chặng (gửi đồ / nhận lại): hình thức + trạng thái, giờ hẹn, địa chỉ, mã vận đơn. */
function Leg({
  title,
  method,
  status,
  timeLabel,
  time,
  addressLabel,
  address,
  feeLabel,
  feeValue,
  trackingCode,
}: LegProps) {
  return (
    <Card>
      <Stack gap={8}>
        <Title order={5}>{title}</Title>
        <Field label="Hình thức">
          <Group gap="xs">
            {method}
            {status && (
              <Badge variant="light" size="sm">
                {status}
              </Badge>
            )}
          </Group>
        </Field>
        {time && <Field label={timeLabel}>{time}</Field>}
        {address && <Field label={addressLabel}>{address}</Field>}
        {feeValue && <Field label={feeLabel ?? ''}>{feeValue}</Field>}
        {trackingCode && (
          <Field label="Mã vận đơn">
            <CopyableCode code={trackingCode} />
          </Field>
        )}
      </Stack>
    </Card>
  )
}

/** Chỉ đọc: thao tác nằm ở header (menu ⋯). Chỉ render với đơn online (fulfillment khác null). */
export function OnlineFulfillmentCard({ order }: { order: OrderDetail }) {
  const f = order.fulfillment
  if (!f) return null
  const appointmentTime = f.appointmentAt && (
    <>
      {dateTime(f.appointmentAt)}
      {f.appointmentOverdue && (
        <Text span size="sm" c="danger">
          {' · quá giờ hẹn'}
        </Text>
      )}
    </>
  )

  // Liên hệ chỉ hiện khi khác khách hàng (thẻ Khách hàng ở Tổng quan đã có tên + SĐT)
  const digits = (v: string) => v.replace(/\D/g, '')
  const contactDiffers =
    f.contactName.trim().toLowerCase() !== order.customerName.trim().toLowerCase() ||
    digits(f.contactPhone) !== digits(order.customerPhone)

  return (
    <Stack gap="lg">
      {f.customerRejectReason && (
        <Alert color="warning" title="Lý do gửi khách">
          {f.customerRejectReason}
        </Alert>
      )}
      {contactDiffers && (
        <Card>
          <Stack gap={8}>
            <Title order={5}>Liên hệ</Title>
            <Field label="Người liên hệ">
              {f.contactName} · <a href={`tel:${f.contactPhone}`}>{formatPhone(f.contactPhone)}</a>
            </Field>
          </Stack>
        </Card>
      )}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" style={{ alignItems: 'start' }}>
        <Leg
          title="Gửi đồ"
          method={DROPOFF_METHOD_LABEL[f.dropoffMethod]}
          status={f.dropoffStatus && DROPOFF_STATUS_LABEL[f.dropoffStatus]}
          timeLabel="Giờ hẹn"
          time={appointmentTime}
          addressLabel="Địa chỉ lấy"
          address={joinAddress(f.pickupAddress, f.pickupAreaName)}
          feeLabel="Phí lấy"
          feeValue={f.dropoffMethod === 'PICKUP' ? fee(f.pickupFee) : null}
          trackingCode={f.pickupTrackingCode}
        />
        <Leg
          title="Nhận lại"
          method={RETURN_METHOD_LABEL[f.returnMethod]}
          status={f.returnStatus && RETURN_STATUS_LABEL[f.returnStatus]}
          timeLabel="Giờ nhận"
          time={order.dueAt && dateTime(order.dueAt)}
          addressLabel="Địa chỉ giao"
          address={joinAddress(f.deliveryAddress, f.deliveryAreaName)}
          feeLabel="Phí giao"
          feeValue={f.returnMethod === 'DELIVERY' ? fee(f.deliveryFee) : null}
          trackingCode={f.deliveryTrackingCode}
        />
      </SimpleGrid>
    </Stack>
  )
}
