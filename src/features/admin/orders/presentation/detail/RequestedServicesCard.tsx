import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { LuClipboardList } from 'react-icons/lu'
import { priceFor, UNIT_LABEL, useActiveServices } from '@/features/admin/services'
import { formatMoney } from '@/shared/common/lib/format'
import { EmptyState } from '@/shared/admin/ui'
import type { OrderDetail } from '../../domain/types'

export function RequestedServicesCard({ order }: { order: OrderDetail }) {
  const { data: services = [], isPending } = useActiveServices()
  const { requestedServices, washWhitesSeparately } = order
  const hasAny = requestedServices.length > 0

  return (
    <Card>
      <Title order={5}>Dịch vụ khách chọn</Title>
      <div className="mt-1 mb-3 empty:hidden">
        {order.washModeName && (
          <Text size="sm" fw={500}>
            Hình thức giặt: {order.washModeName}
          </Text>
        )}
        {washWhitesSeparately && (
          <Text size="xs" c="dimmed">
            + Đồ trắng
          </Text>
        )}
      </div>
      {hasAny ? (
        <Stack gap="xs">
          {requestedServices.length > 0 && (
            <Stack
              gap={0}
              className="rounded-md border border-solid"
              style={{ borderColor: 'var(--mantine-color-default-border)' }}
            >
              {requestedServices.map((r, i) => {
                const active = services.find((s) => s.id === r.id)
                const inactive = r.name !== null && !isPending && !active
                // Giá đã chụp lúc tạo đơn; đơn không có ảnh chụp thì giá hình thức hiện hành
                const price =
                  r.unitPrice ??
                  (active && order.washModeId != null ? priceFor(active, order.washModeId) : null)
                const unit = r.unit ?? active?.unit
                return (
                  <Group
                    key={r.id}
                    justify="space-between"
                    wrap="nowrap"
                    px="md"
                    py="xs"
                    style={
                      i > 0
                        ? { borderTop: '1px solid var(--mantine-color-default-border)' }
                        : undefined
                    }
                  >
                    <Text size="sm" miw={0}>
                      {r.name ?? `#${r.id}`}
                      {inactive && (
                        <Text span size="sm" c="dimmed">
                          {' '}
                          (Ngừng kinh doanh)
                        </Text>
                      )}
                    </Text>
                    {price != null && (
                      <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {formatMoney(price)}/{unit ? UNIT_LABEL[unit] : 'đơn vị'}
                      </Text>
                    )}
                  </Group>
                )
              })}
            </Stack>
          )}
        </Stack>
      ) : (
        <EmptyState icon={<LuClipboardList size={32} />} title="Chưa ghi nhận" />
      )}
    </Card>
  )
}
