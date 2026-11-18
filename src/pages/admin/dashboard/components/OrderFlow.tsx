import { Card, Group, Text, UnstyledButton } from '@mantine/core'
import { Fragment } from 'react'
import { LuChevronRight } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import type { Dashboard, DashboardPreset } from '@/features/admin/reports'
import { formatNumber } from '@/shared/common/lib/format'
import { PATHS } from '@/shared/common/config/paths'

const DELIVERED_LABEL: Record<DashboardPreset, string> = {
  today: 'Đã giao hôm nay',
  '7d': 'Đã giao 7 ngày',
  month: 'Đã giao tháng này',
}

/** Các bước của đơn theo thứ tự; mỗi bước mở danh sách đã lọc. */
export function OrderFlow({
  orders,
  preset,
}: {
  orders: Dashboard['orders']
  preset: DashboardPreset
}) {
  const steps = [
    { label: 'Mới nhận', value: orders.waiting, to: `${PATHS.workList}?status=RECEIVED` },
    { label: 'Đang xử lý', value: orders.processing, to: `${PATHS.workList}?status=PROCESSING` },
    {
      label: 'Chờ khách lấy',
      value: orders.readyForPickup,
      to: `${PATHS.orders}?status=COMPLETED`,
    },
    {
      label: DELIVERED_LABEL[preset],
      value: orders.delivered,
      to: `${PATHS.orders}?status=DELIVERED`,
    },
  ]
  return (
    <Card mb="lg" py="sm">
      <Group gap="xs" wrap="wrap" justify="space-between">
        <Text size="sm" fw={600} c="dimmed" visibleFrom="lg">
          Luồng đơn
        </Text>
        {steps.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && <LuChevronRight size={16} aria-hidden className="text-muted-foreground" />}
            <UnstyledButton component={Link} to={s.to} className="ds-flow-step">
              <Group gap={8} wrap="nowrap">
                <Text fw={700} size="xl">
                  {formatNumber(s.value)}
                </Text>
                <Text size="sm" c="dimmed">
                  {s.label}
                </Text>
              </Group>
            </UnstyledButton>
          </Fragment>
        ))}
      </Group>
    </Card>
  )
}
