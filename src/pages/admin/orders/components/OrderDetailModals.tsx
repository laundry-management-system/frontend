import type { Dispatch, SetStateAction } from 'react'
import {
  type AdminAction,
  AdminReasonModal,
  CancelOrderModal,
  type CheckoutDone,
  CheckoutModal,
  checkoutMode,
  CompleteDropoffModal,
  CompleteOnBehalfModal,
  CompleteOrderModal,
  ConfirmOnlineOrderModal,
  DiscrepancyModal,
  isAwaitingPayment,
  type NotificationResult,
  NotifyModal,
  type OrderDetail,
  PaymentClaimChooserModal,
  type PaymentTxn,
  RejectOrderModal,
  RejectPaymentClaimModal,
  ResolvePaymentModal,
  StartDeliveryModal,
} from '@/features/admin/orders'

export type ModalState =
  | null
  | { kind: 'complete' }
  | { kind: 'notify' }
  | { kind: 'cancel' }
  | { kind: 'confirm' }
  | { kind: 'reject' }
  | { kind: 'rejectClaim' }
  | { kind: 'claimChooser' }
  | { kind: 'dropoff' }
  | { kind: 'onBehalf' }
  | { kind: 'startDelivery' }
  | { kind: 'admin'; mode: Exclude<AdminAction, 'cancel'> }
  | { kind: 'checkout' }
  | { kind: 'discrepancy' }
  | { kind: 'resolve'; payment: PaymentTxn }

interface Props {
  order: OrderDetail
  modal: ModalState
  setModal: Dispatch<SetStateAction<ModalState>>
  onNotified: (r: NotificationResult) => void
  onStarted: () => void
  onDropoffDone: () => void
  onCheckoutDone: (r: CheckoutDone) => void
}

export function OrderDetailModals({
  order,
  modal,
  setModal,
  onNotified,
  onStarted,
  onDropoffDone,
  onCheckoutDone,
}: Props) {
  const mode = checkoutMode(order)
  const closeModal = () => setModal(null)
  const openCheckout = () => setModal({ kind: 'checkout' })
  const openRejectClaim = () => setModal({ kind: 'rejectClaim' })
  const openDiscrepancy = () => setModal({ kind: 'discrepancy' })
  // Ghi nhận chênh lệch chỉ mở từ màn thanh toán: đóng thì quay lại màn đó
  const closeDiscrepancy = openCheckout

  return (
    <>
      {modal?.kind === 'complete' && (
        <CompleteOrderModal order={order} onClose={closeModal} onNotified={onNotified} />
      )}
      {modal?.kind === 'notify' && (
        <NotifyModal order={order} onClose={closeModal} onNotified={onNotified} />
      )}
      {modal?.kind === 'cancel' && <CancelOrderModal order={order} onClose={closeModal} />}
      {modal?.kind === 'confirm' && <ConfirmOnlineOrderModal order={order} onClose={closeModal} />}
      {modal?.kind === 'reject' && <RejectOrderModal order={order} onClose={closeModal} />}
      {modal?.kind === 'claimChooser' && (
        <PaymentClaimChooserModal
          order={order}
          onConfirm={openCheckout}
          onReject={openRejectClaim}
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'rejectClaim' && (
        <RejectPaymentClaimModal order={order} onClose={closeModal} />
      )}
      {modal?.kind === 'dropoff' && (
        <CompleteDropoffModal order={order} onClose={closeModal} onDone={onDropoffDone} />
      )}
      {modal?.kind === 'onBehalf' && <CompleteOnBehalfModal order={order} onClose={closeModal} />}
      {modal?.kind === 'startDelivery' && (
        <StartDeliveryModal order={order} onClose={closeModal} onStarted={onStarted} />
      )}
      {modal?.kind === 'admin' && (
        <AdminReasonModal order={order} initialMode={modal.mode} onClose={closeModal} />
      )}
      {modal?.kind === 'checkout' && mode && (
        <CheckoutModal
          order={order}
          mode={mode}
          payOnly={isAwaitingPayment(order)}
          onClose={closeModal}
          onDiscrepancy={openDiscrepancy}
          onDone={onCheckoutDone}
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
}
