import {
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Stack,
  Stepper,
  Text,
  Tooltip,
} from '@mantine/core'
import { type MouseEvent, useState } from 'react'
import { LuCloudOff, LuMessageCircle, LuPackageX, LuPrinter, LuReceiptText } from 'react-icons/lu'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { selectHasRole, useAuthStore } from '@/features/auth'
import { useMe, useUserName } from '@/features/users'
import {
  type AdminAction,
  AdminActionsCard,
  AdminReasonModal,
  canCancel,
  buildInvoice,
  CancelOrderModal,
  type CheckoutDone,
  CheckoutModal,
  checkoutMode,
  CompleteOrderModal,
  confirmedTxn,
  DiscrepancyModal,
  type Invoice,
  InvoicePrintArea,
  type NotificationResult,
  NotifyModal,
  OrderCustomerCard,
  OrderHistoryCard,
  OrderIncidentCard,
  OrderItemsCard,
  OrderNotifyCard,
  OrderPaymentCard,
  OrderStatusCell,
  ORDER_TYPE_LABEL,
  type PaymentTxn,
  primaryActionOf,
  ReceiptPrintArea,
  ResolvePaymentModal,
  useIntakeOrders,
  useOrder,
  usePayments,
  usePrintInvoice,
  usePrintReceipt,
  useShopInfo,
  useStartProcessing,
} from '@/features/orders'
import { toApiError } from '@/shared/api/apiError'
import { formatDateTime } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { EmptyState, EntityCode, PageHeader, RowActions, StatusBadge } from '@/shared/ui'

type ModalState =
  | null
  | { kind: 'complete' }
  | { kind: 'notify' }
  | { kind: 'cancel' }
  | { kind: 'admin'; mode: 'revert' | 'reschedule' | 'price' }
  | { kind: 'checkout' }
  | { kind: 'discrepancy' }
  | { kind: 'resolve'; payment: PaymentTxn }

// Đã giao là bước cuối: active = số bước để mọi bước đều hiện dấu tick
const STEP_OF = { RECEIVED: 0, PROCESSING: 1, COMPLETED: 2, DELIVERED: 4, CANCELLED: 0 } as const

const dateTime = (iso: string) => formatDateTime(iso).slice(0, 16)

export default function OrderDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  const { data: order, isLoading, error, refetch } = useOrder(Number.isFinite(id) ? id : null)
  const intake = useIntakeOrders(order?.intakeCode)
  const sibling = intake.data?.find((o) => o.id !== order?.id)
  const { receipts, print, isPrinting } = usePrintReceipt()
  const start = useStartProcessing()
  const [modal, setModal] = useState<ModalState>(null)
  // BE chỉ trả số lần nhắn khi soạn tin (handoff 008 #6a)
  const [lastNotification, setLastNotification] = useState<NotificationResult | null>(null)
  const payments = usePayments(order?.orderCode)
  const txn = confirmedTxn(payments.data ?? [])
  const shop = useShopInfo(order?.id ?? null)
  const confirmerName = useUserName(txn?.confirmedBy ?? null)
  const me = useMe()
  const invoicePrint = usePrintInvoice()

  const handleRetry = () => refetch()
  const closeModal = () => setModal(null)

  if (isLoading)
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    )

  if (!order) {
    const loadFailed = !!error && toApiError(error).status !== 404
    return (
      <EmptyState
        icon={loadFailed ? <LuCloudOff size={32} /> : <LuPackageX size={32} />}
        title={loadFailed ? 'Không tải được đơn' : 'Không tìm thấy đơn'}
        description={
          loadFailed
            ? 'Vui lòng kiểm tra kết nối rồi thử lại.'
            : 'Đơn này không tồn tại hoặc đường dẫn không đúng.'
        }
        action={
          loadFailed ? (
            <Button variant="secondary" onClick={handleRetry}>
              Thử lại
            </Button>
          ) : (
            <Button variant="secondary" component={Link} to="/orders">
              Về danh sách đơn
            </Button>
          )
        }
      />
    )
  }

  const primary = primaryActionOf(order)
  const classify = () => navigate(`/classify?order=${order.id}`)
  const startProcessing = () =>
    start.mutate(order.id, {
      onSuccess: () => notify.success('Đã chuyển sang Đang xử lý'),
      onError: (e) => notify.error(toApiError(e).message),
    })
  const reprint = () =>
    print(order.id).catch((e) => notify.error(toApiError(e).message, 'Chưa in được phiếu'))
  const onAdminAction = (action: AdminAction) =>
    setModal(action === 'cancel' ? { kind: 'cancel' } : { kind: 'admin', mode: action })
  const canNotify = order.status === 'COMPLETED'
  const openComplete = () => setModal({ kind: 'complete' })
  const mode = checkoutMode(order)
  const openCheckout = () => setModal({ kind: 'checkout' })
  const openDiscrepancy = () => setModal({ kind: 'discrepancy' })
  // Ghi nhận chênh lệch chỉ mở từ màn thanh toán: đóng thì quay lại màn đó
  const closeDiscrepancy = () => setModal({ kind: 'checkout' })
  const makeInvoice = (t: PaymentTxn, name: string, extra: Pick<Invoice, 'cash' | 'receiver'>) =>
    buildInvoice(order, t, {
      shopName: shop.data?.shopName ?? '',
      hotline: shop.data?.hotline ?? '',
      confirmedByName: name,
      ...extra,
    })
  const printInvoice = () =>
    txn &&
    invoicePrint.print(
      makeInvoice(txn, confirmerName, {
        cash: null,
        receiver: order.deliveredAt
          ? { name: order.receiverName, relation: order.receiverRelation }
          : null,
      }),
    )
  const handleCheckoutDone = ({ payment, delivery, cash }: CheckoutDone) => {
    const t = payment ?? txn
    if (!t) return
    // Giao dịch vừa tạo do chính người đang đăng nhập xác nhận
    const name = payment ? (me.data?.fullName ?? '') : confirmerName
    const receiver = delivery
      ? { name: delivery.receiverName, relation: delivery.receiverRelation }
      : null
    invoicePrint.print(makeInvoice(t, name, { cash, receiver }))
  }
  const openResolve = (payment: PaymentTxn) => setModal({ kind: 'resolve', payment })
  const handleNotifyClick = (e: MouseEvent) =>
    canNotify ? setModal({ kind: 'notify' }) : e.preventDefault()

  const primaryButton =
    // Chưa phân loại: nút "Phân loại ngay" nằm trong thẻ Chi tiết đồ giặt, không lặp ở header
    primary === 'START' ? (
      <Button size="md" loading={start.isPending} onClick={startProcessing}>
        Bắt đầu xử lý
      </Button>
    ) : primary === 'COMPLETE' ? (
      <Button size="md" onClick={openComplete}>
        Hoàn thành
      </Button>
    ) : mode ? (
      <Button size="md" onClick={openCheckout}>
        {mode === 'checkout' ? 'Thanh toán & trả đồ' : 'Trả đồ'}
      </Button>
    ) : null

  const cancelActions = [
    { label: 'Hủy đơn', danger: true, onClick: () => setModal({ kind: 'cancel' as const }) },
  ]

  const headerDescription = (
    <>
      Nhận {dateTime(order.receivedAt)} bởi {order.createdBy ?? '—'}
      {order.intakeCode && (
        <>
          {' · lượt '}
          <EntityCode code={order.intakeCode} size="sm" />
        </>
      )}
      {sibling && (
        <>
          {` · đơn ${ORDER_TYPE_LABEL[sibling.orderType].toLowerCase()} cùng lượt `}
          <Anchor component={Link} to={`/orders/${sibling.id}`}>
            <EntityCode code={sibling.orderCode} size="sm" />
          </Anchor>
        </>
      )}
    </>
  )

  const headerActions = (
    <Group gap="sm">
      <Button
        variant="secondary"
        leftSection={<LuPrinter size={16} />}
        loading={isPrinting}
        onClick={reprint}
      >
        In lại phiếu
      </Button>
      <Tooltip label="Nhắn được khi đơn đã Hoàn thành" disabled={canNotify}>
        <Button
          variant="secondary"
          leftSection={<LuMessageCircle size={16} />}
          data-disabled={!canNotify || undefined}
          onClick={handleNotifyClick}
        >
          Nhắn khách
        </Button>
      </Tooltip>
      {txn && (
        <Button
          variant="secondary"
          leftSection={<LuReceiptText size={16} />}
          disabled={!shop.data}
          onClick={printInvoice}
        >
          In hóa đơn
        </Button>
      )}
      {!isAdmin && canCancel(order) && <RowActions items={cancelActions} />}
      {primaryButton}
    </Group>
  )

  const statusCard = (
    <Card mb="lg">
      <Stack gap="md">
        <Group gap="xs">
          <OrderStatusCell status={order.status} isOverdue={order.isOverdue} />
          {order.status !== 'CANCELLED' && (
            <StatusBadge group="payment" statusKey={order.paymentStatus.toLowerCase()} size="sm" />
          )}
          {order.orderType === 'EXPRESS' ? (
            <StatusBadge group="flag" statusKey="express" size="sm" />
          ) : (
            <Text size="sm" c="dimmed">
              {ORDER_TYPE_LABEL.NORMAL}
            </Text>
          )}
          <Text size="sm" c="dimmed">
            · Hẹn trả {dateTime(order.dueAt)} · {order.bagCount} túi
            {order.shelfLocation && ` · Kệ ${order.shelfLocation}`}
          </Text>
        </Group>
        {order.status === 'CANCELLED' ? (
          <Alert color="danger" title="Đơn đã hủy">
            Lý do xem trong lịch sử trạng thái.
          </Alert>
        ) : (
          <Stepper active={STEP_OF[order.status]} size="sm" allowNextStepsSelect={false}>
            <Stepper.Step label="Mới nhận" />
            <Stepper.Step label="Đang xử lý" />
            <Stepper.Step label="Hoàn thành" />
            <Stepper.Step label="Đã giao" />
          </Stepper>
        )}
      </Stack>
    </Card>
  )

  const modals = (
    <>
      {modal?.kind === 'complete' && (
        <CompleteOrderModal order={order} onClose={closeModal} onNotified={setLastNotification} />
      )}
      {modal?.kind === 'notify' && (
        <NotifyModal order={order} onClose={closeModal} onNotified={setLastNotification} />
      )}
      {modal?.kind === 'cancel' && <CancelOrderModal order={order} onClose={closeModal} />}
      {modal?.kind === 'admin' && (
        <AdminReasonModal order={order} initialMode={modal.mode} onClose={closeModal} />
      )}
      {modal?.kind === 'checkout' && mode && (
        <CheckoutModal
          order={order}
          mode={mode}
          onClose={closeModal}
          onDiscrepancy={openDiscrepancy}
          onDone={handleCheckoutDone}
        />
      )}
      {modal?.kind === 'discrepancy' && (
        <DiscrepancyModal order={order} onClose={closeDiscrepancy} />
      )}
      {modal?.kind === 'resolve' && (
        <ResolvePaymentModal order={order} payment={modal.payment} onClose={closeModal} />
      )}
    </>
  )

  return (
    <>
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to="/orders" size="sm">
          Đơn hàng
        </Anchor>
        <EntityCode code={order.orderCode} size="sm" />
      </Breadcrumbs>
      <PageHeader
        title={<EntityCode code={order.orderCode} size="display" />}
        description={headerDescription}
        actions={headerActions}
      />

      {statusCard}

      <Grid gap="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <OrderItemsCard
              items={order.items}
              requestedServices={order.requestedServices}
              onClassify={order.status === 'RECEIVED' ? classify : undefined}
            />
            <OrderHistoryCard history={order.history} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <OrderCustomerCard order={order} />
            <OrderPaymentCard order={order} onResolve={isAdmin ? openResolve : undefined} />
            <OrderNotifyCard last={lastNotification} />
            <OrderIncidentCard />
            {isAdmin && <AdminActionsCard status={order.status} onAction={onAdminAction} />}
          </Stack>
        </Grid.Col>
      </Grid>

      {modals}
      <ReceiptPrintArea receipts={receipts} />
      <InvoicePrintArea invoice={invoicePrint.invoice} />
    </>
  )
}
