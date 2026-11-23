import {
  Anchor,
  Badge,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
  VisuallyHidden,
} from '@mantine/core'
import { useSearchParams } from 'react-router-dom'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import { OrderIncidentsCard, useIncidents } from '@/features/admin/incidents'
import {
  defaultDetailTab,
  type DetailTab,
  type NotificationResult,
  OnlineFulfillmentCard,
  OrderCustomerCard,
  OrderHistoryCard,
  OrderItemsCard,
  OrderNotifyCard,
  OrderPaymentCard,
  type OrderDetail,
  type PaymentTxn,
  RequestedServicesCard,
  usePayments,
  visibleDetailTabs,
} from '@/features/admin/orders'
import { formatDateTime } from '@/shared/common/lib/format'

export function OrderDetailTabs({
  order,
  lastNotification,
  onResolve,
}: {
  order: OrderDetail
  lastNotification: NotificationResult | null
  onResolve: (p: PaymentTxn) => void
}) {
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  const [params, setParams] = useSearchParams()
  const incidents = useIncidents({ orderId: order.id, page: 0, size: 50 })
  const incidentCount = incidents.data?.content.length ?? 0
  const payments = usePayments(order.orderCode)
  const tabInput = {
    channel: order.channel,
    status: order.status,
    paymentStatus: order.paymentStatus,
    hasItems: order.items.length > 0,
    hasIncidents: incidentCount > 0,
    hasPayments: (payments.data?.length ?? 0) > 0,
  }
  const visible = visibleDetailTabs(tabInput)

  const handleTabChange = (value: string | null) =>
    value && setParams({ tab: value }, { replace: true })
  const goIncidents = () => setParams({ tab: 'incidents' }, { replace: true })

  const requested = params.get('tab')
  const tab: DetailTab = visible.includes(requested as DetailTab)
    ? (requested as DetailTab)
    : defaultDetailTab(tabInput)
  const unpaid = order.status !== 'CANCELLED' && order.paymentStatus === 'UNPAID'

  const incidentSummary = (
    <Card>
      <Stack gap="sm">
        <Title order={5}>Sự cố</Title>
        {incidentCount ? (
          <Group justify="space-between">
            <Text size="sm">{incidentCount} sự cố của đơn này</Text>
            <Anchor component="button" type="button" size="sm" onClick={goIncidents}>
              Xem sự cố
            </Anchor>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            Chưa có sự cố.
          </Text>
        )}
      </Stack>
    </Card>
  )

  const scheduleCard = (
    <Card>
      <Stack gap="sm">
        <Title order={5}>Lịch trả đồ</Title>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Hẹn trả
          </Text>
          <Text size="sm" fw={order.isOverdue ? 700 : 500} c={order.isOverdue ? 'red' : undefined}>
            {formatDateTime(order.dueAt).slice(0, 16)}
            {order.isOverdue && <VisuallyHidden> (trễ hẹn trả)</VisuallyHidden>}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Túi · Kệ
          </Text>
          <Text size="sm" fw={500}>
            {order.bagCount} túi{order.shelfLocation && ` · Kệ ${order.shelfLocation}`}
          </Text>
        </Group>
      </Stack>
    </Card>
  )

  const noteCard = order.note && (
    <Card>
      <Stack gap="sm">
        <Title order={5}>Ghi chú đơn</Title>
        <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
          {order.note}
        </Text>
      </Stack>
    </Card>
  )

  return (
    <Tabs value={tab} onChange={handleTabChange} keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="overview">Tổng quan</Tabs.Tab>
        {visible.includes('items') && <Tabs.Tab value="items">Đồ giặt & giá</Tabs.Tab>}
        {visible.includes('fulfillment') && <Tabs.Tab value="fulfillment">Giao nhận</Tabs.Tab>}
        {visible.includes('payment') && (
          <Tabs.Tab
            value="payment"
            rightSection={
              unpaid && <Badge size="xs" circle color="warning" aria-label="Chưa thanh toán" />
            }
          >
            Thanh toán
          </Tabs.Tab>
        )}
        {visible.includes('incidents') && (
          <Tabs.Tab
            value="incidents"
            rightSection={
              incidentCount > 0 && (
                <Badge size="sm" circle color="danger">
                  {incidentCount}
                </Badge>
              )
            }
          >
            Sự cố
          </Tabs.Tab>
        )}
        <Tabs.Tab value="history">Lịch sử</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview" pt="lg">
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" style={{ alignItems: 'start' }}>
          <RequestedServicesCard order={order} />
          <Stack gap="lg">
            <OrderCustomerCard order={order} />
            {scheduleCard}
            {noteCard}
            {visible.includes('incidents') && incidentSummary}
            <OrderNotifyCard last={lastNotification} />
          </Stack>
        </SimpleGrid>
      </Tabs.Panel>
      <Tabs.Panel value="items" pt="lg">
        <Grid gap="lg" align="flex-start">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <OrderItemsCard
              items={order.items}
              requestedServices={order.requestedServices}
              expressFee={order.expressFee}
              whitesFee={order.whitesFee}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <OrderPaymentCard order={order} part="costs" />
          </Grid.Col>
        </Grid>
      </Tabs.Panel>
      <Tabs.Panel value="fulfillment" pt="lg">
        <OnlineFulfillmentCard order={order} />
      </Tabs.Panel>
      <Tabs.Panel value="payment" pt="lg">
        <OrderPaymentCard
          order={order}
          part="transactions"
          onResolve={isAdmin ? onResolve : undefined}
        />
      </Tabs.Panel>
      <Tabs.Panel value="incidents" pt="lg">
        <OrderIncidentsCard orderId={order.id} cancelled={order.status === 'CANCELLED'} />
      </Tabs.Panel>
      <Tabs.Panel value="history" pt="lg">
        <OrderHistoryCard history={order.history} />
      </Tabs.Panel>
    </Tabs>
  )
}
