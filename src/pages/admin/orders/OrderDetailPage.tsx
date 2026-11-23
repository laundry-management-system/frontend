import { Anchor, Badge, Breadcrumbs, Button, Center, Group, Loader } from '@mantine/core'
import { useState } from 'react'
import { LuCloudOff, LuMessageCircle, LuPackageX } from 'react-icons/lu'
import { Link, useParams } from 'react-router-dom'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import {
  type AdminAction,
  adminMenuItems,
  awaitsCustomerReceipt,
  canCancel,
  canCompleteDropoff,
  canConfirm,
  canDeliver,
  canReject,
  canRejectPaymentClaim,
  canStartDelivery,
  checkoutMode,
  InvoicePrintArea,
  isAwaitingPayment,
  type NotificationResult,
  OrderChannelBadge,
  OrderPaymentBadge,
  type PaymentTxn,
  preReceiptLockReason,
  primaryActionOf,
  ReceiptPrintArea,
  useOrder,
  usePrintReceipt,
  useStartProcessing,
} from '@/features/admin/orders'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { EmptyState, EntityCode, PageHeader, type RowAction, RowActions } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'
import { OrderDetailTabs } from './components/OrderDetailTabs'
import { OrderDetailModals, type ModalState } from './components/OrderDetailModals'
import { OrderStatusCard } from './components/OrderDetailSummary'
import { useOrderInvoice } from './components/useOrderInvoice'

export default function OrderDetailPage() {
  const id = Number(useParams().id)
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  const { data: order, isLoading, error, refetch } = useOrder(Number.isFinite(id) ? id : null)
  const { receipts, print, isPrinting } = usePrintReceipt()
  const start = useStartProcessing()
  const [modal, setModal] = useState<ModalState>(null)
  // BE chỉ trả số lần nhắn khi soạn tin (handoff 008 #6a)
  const [lastNotification, setLastNotification] = useState<NotificationResult | null>(null)
  const { invoice, canPrintInvoice, printInvoice, handleCheckoutDone } = useOrderInvoice(order)

  const handleRetry = () => refetch()

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
            <Button variant="secondary" component={Link} to={PATHS.orders}>
              Về danh sách đơn
            </Button>
          )
        }
      />
    )
  }

  const primary = primaryActionOf(order)
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
  const openResolve = (payment: PaymentTxn) => setModal({ kind: 'resolve', payment })
  const openNotify = () => setModal({ kind: 'notify' })
  const openClaimChooser = () => setModal({ kind: 'claimChooser' })

  const primaryButton =
    primary === 'CLASSIFY' ? (
      <Button size="md" component={Link} to={`${PATHS.classify}?order=${order.id}`}>
        Phân loại đồ
      </Button>
    ) : primary === 'START' ? (
      <Button size="md" loading={start.isPending} onClick={startProcessing}>
        Bắt đầu xử lý
      </Button>
    ) : primary === 'COMPLETE' ? (
      <Button size="md" onClick={openComplete}>
        Hoàn thành
      </Button>
    ) : mode && canDeliver(order) && !awaitsCustomerReceipt(order) ? (
      <Button size="md" onClick={openCheckout}>
        {mode === 'checkout' ? 'Thanh toán & trả đồ' : 'Trả đồ'}
      </Button>
    ) : null

  const lockReason = preReceiptLockReason(order)
  const openConfirm = () => setModal({ kind: 'confirm' })
  const openReject = () => setModal({ kind: 'reject' })

  const openCancel = () => setModal({ kind: 'cancel' })
  const openOnBehalf = () => setModal({ kind: 'onBehalf' })
  const openDropoff = () => setModal({ kind: 'dropoff' })
  const openStartDelivery = () => setModal({ kind: 'startDelivery' })
  const menuItems: RowAction[] = [
    { label: 'In lại phiếu', hidden: !!lockReason || isPrinting, onClick: reprint },
    { label: 'In hóa đơn', hidden: !canPrintInvoice, onClick: printInvoice },
    {
      label: 'Hoàn tất thay khách',
      hidden: !mode || !awaitsCustomerReceipt(order),
      onClick: mode === 'handover' ? openOnBehalf : openCheckout,
    },
    ...(isAdmin ? adminMenuItems({ order, onAction: onAdminAction }) : []),
  ]

  const headerActions = (
    <Group gap="sm">
      {canConfirm(order) && <Button onClick={openConfirm}>Xác nhận</Button>}
      {canCompleteDropoff(order) && (
        <Button onClick={openDropoff}>
          {order.fulfillment?.dropoffMethod === 'PICKUP'
            ? 'Đã lấy đồ từ khách'
            : 'Khách đã tới đưa đồ'}
        </Button>
      )}
      {isAwaitingPayment(order) && (
        <>
          {order.paymentClaimedAt && (
            <Badge variant="light" color="warning">
              Khách báo đã chuyển khoản
            </Badge>
          )}
          {canRejectPaymentClaim(order) ? (
            <Button onClick={openClaimChooser}>Xử lý thanh toán</Button>
          ) : (
            <Button onClick={openCheckout}>Xác nhận đã nhận tiền</Button>
          )}
        </>
      )}
      {canStartDelivery(order) && <Button onClick={openStartDelivery}>Bắt đầu giao</Button>}
      {primaryButton}
      {canReject(order) && (
        <Button variant="light" color="danger" onClick={openReject}>
          Từ chối
        </Button>
      )}
      {canCancel(order) && (
        <Button variant="light" color="danger" onClick={openCancel}>
          Hủy đơn
        </Button>
      )}
      {canNotify && (
        <Button
          variant="secondary"
          leftSection={<LuMessageCircle size={16} />}
          onClick={openNotify}
        >
          Nhắn khách
        </Button>
      )}
      <RowActions items={menuItems} />
    </Group>
  )

  return (
    <>
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to={PATHS.orders} size="sm">
          Đơn hàng
        </Anchor>
        <EntityCode code={order.orderCode} size="sm" />
      </Breadcrumbs>
      <PageHeader
        title={<EntityCode code={order.orderCode} size="display" />}
        info={lockReason}
        meta={
          <>
            <OrderChannelBadge channel={order.channel} />
            <OrderPaymentBadge status={order.status} paymentStatus={order.paymentStatus} />
          </>
        }
        actions={headerActions}
      />

      <OrderStatusCard order={order} />

      <OrderDetailTabs order={order} lastNotification={lastNotification} onResolve={openResolve} />

      <OrderDetailModals
        order={order}
        modal={modal}
        setModal={setModal}
        onNotified={setLastNotification}
        onStarted={printInvoice}
        onDropoffDone={reprint}
        onCheckoutDone={handleCheckoutDone}
      />
      <ReceiptPrintArea receipts={receipts} />
      <InvoicePrintArea invoice={invoice} />
    </>
  )
}
