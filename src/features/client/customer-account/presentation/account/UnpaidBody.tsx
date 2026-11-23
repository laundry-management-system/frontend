import { useState } from 'react'
import { LuPencil } from 'react-icons/lu'
import { formatMoney } from '@/shared/common/lib/format'
import { useRemoveMyOrderVoucher } from '../../application/mutations/useMyOrderPaymentActions'
import type { CustomerOrderDetail, PaymentQr as PaymentQrData } from '../../domain/types'
import { ClaimConfirmModal } from './ClaimConfirmModal'
import { Breakdown } from './PaymentBreakdown'
import { TransferContent } from './TransferContent'
import { VoucherForm } from './VoucherForm'

export function UnpaidBody({ order, qr }: { order: CustomerOrderDetail; qr: PaymentQrData }) {
  const orderCode = order.orderCode
  const [changing, setChanging] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const remove = useRemoveMyOrderVoucher(orderCode)
  const claimed = order.paymentClaimedAt != null
  const hasVoucher = order.money.voucherCode != null
  const editing = order.voucherEditable && (!hasVoucher || changing)

  const toggleChanging = () => setChanging((v) => !v)
  const stopChanging = () => setChanging(false)
  const removeVoucher = () => remove.mutate(undefined, { onSuccess: stopChanging })
  const openConfirm = () => setConfirming(true)
  const closeConfirm = () => setConfirming(false)

  const chipActions = order.voucherEditable && (
    <button
      type="button"
      onClick={toggleChanging}
      aria-label="Sửa voucher"
      className="-my-3 -mr-1 grid size-11 cursor-pointer place-items-center text-(--pub-accent-ink)"
    >
      <LuPencil size={16} aria-hidden="true" />
    </button>
  )

  return (
    <div className="grid justify-items-center gap-4 text-(length:--pub-text-md)">
      <Breakdown order={order} chipActions={chipActions} />
      {editing && (
        <VoucherForm
          key={String(changing)}
          orderCode={orderCode}
          initialCode={changing ? (order.money.voucherCode ?? '') : ''}
          onDone={stopChanging}
          onCancel={changing ? stopChanging : undefined}
          onRemove={changing ? removeVoucher : undefined}
          removing={remove.isPending}
        />
      )}
      {order.paymentClaimRejectedReason && !claimed && (
        <p role="alert" className="w-full text-(--pub-danger)">
          Tiệm chưa nhận được tiền: {order.paymentClaimRejectedReason}
        </p>
      )}
      <img
        src={qr.qrImageUrl}
        alt="Mã QR chuyển khoản"
        className="size-56 rounded-(--pub-radius-md) border border-(--pub-border) bg-white object-contain"
      />
      <p className="-mt-2 text-(length:--pub-text-xl) font-bold text-(--pub-accent-ink)">
        {formatMoney(qr.amount)}
      </p>
      <TransferContent text={qr.transferContent} />
      <dl className="grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <dt className="text-(--pub-ink-muted)">Số tài khoản</dt>
        <dd className="font-semibold">{qr.accountNo}</dd>
        <dt className="text-(--pub-ink-muted)">Chủ tài khoản</dt>
        <dd className="font-semibold">{qr.accountName}</dd>
      </dl>
      {claimed ? (
        <p role="status" className="font-semibold text-(--pub-accent-ink)">
          Đã báo thanh toán, chờ tiệm xác nhận
        </p>
      ) : (
        <button type="button" onClick={openConfirm} className="pub-btn pub-btn--primary w-full">
          Đã thanh toán
        </button>
      )}
      <p className="text-center text-(length:--pub-text-sm) text-(--pub-ink-muted)">
        Tiệm sẽ xác nhận thanh toán sau khi nhận được tiền, đơn sẽ được giao sau đó.
      </p>
      <ClaimConfirmModal
        orderCode={orderCode}
        amount={order.money.payableAmount}
        opened={confirming}
        onClose={closeConfirm}
      />
    </div>
  )
}
