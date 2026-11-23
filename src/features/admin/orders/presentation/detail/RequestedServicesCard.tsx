import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { LuClipboardList } from 'react-icons/lu'
import { UNIT_LABEL, useActiveServices } from '@/features/admin/services'
import { formatMoney } from '@/shared/common/lib/format'
import { EmptyState } from '@/shared/admin/ui'
import type { OrderDetail } from '../../domain/types'
import { OrderServiceTags } from '../OrderServiceTags'

export function RequestedServicesCard({ order }: { order: OrderDetail }) {
  const { data: services = [], isPending } = useActiveServices()
  const { requestedServices, washWhitesSeparately } = order
  const hasAny = requestedServices.length > 0

  return (
    <Card>
      <Title order={5}>Dịch vụ khách chọn</Title>
      <div className="mt-1 mb-3 empty:hidden">
        <OrderServiceTags
          orderType={order.orderType}
          washWhitesSeparately={washWhitesSeparately}
          direction="row"
        />
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
                const express = order.orderType === 'EXPRESS' && active?.expressSurcharge != null
                const inactive = r.name !== null && !isPending && !active
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
                    {active && (
                      <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {formatMoney(active.price + (express ? active.expressSurcharge! : 0))}/
                        {active.unit ? UNIT_LABEL[active.unit] : 'đơn vị'}
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
