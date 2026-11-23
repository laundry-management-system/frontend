import dayjs from 'dayjs'
import { Modal, Skeleton } from '@mantine/core'
import { useState } from 'react'
import { LuArrowLeft, LuInbox } from 'react-icons/lu'
import { Link, useParams } from 'react-router-dom'
import {
  OrderItemLines,
  OrderLegs,
  OrderPaymentCard,
  OrderStepper,
  useConfirmMyOrderReceived,
  useMyOrder,
} from '@/features/client/customer-account'
import { Breadcrumb, CopyCodeButton, EntityCode } from '@/shared/client/ui'
import { toApiError } from '@/shared/common/api/apiError'
import { PATHS } from '@/shared/common/config/paths'

const BACK = (
  <Link to={PATHS.customerAccount} className="pub-btn pub-btn--ghost">
    <LuArrowLeft aria-hidden="true" /> Đơn của tôi
  </Link>
)

function Notice({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-(--pub-ink-muted)">
      <LuInbox size={32} aria-hidden="true" />
      <p>{title}</p>
      {BACK}
    </div>
  )
}

function ConfirmReceivedButton({ orderCode }: { orderCode: string }) {
  const [opened, setOpened] = useState(false)
  const confirm = useConfirmMyOrderReceived(orderCode)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpened(true)}
        className="pub-btn pub-btn--primary w-full shrink-0 sm:w-auto"
      >
        Đã nhận được đơn
      </button>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Xác nhận đã nhận đơn" centered>
        <div data-surface="public" data-surface-bg="none" className="grid gap-4">
          <p>
            Xác nhận anh/chị đã nhận đủ đồ? Sau khi xác nhận, đơn sẽ hoàn tất và không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpened(false)}
              className="pub-btn pub-btn--ghost"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={confirm.isPending}
              onClick={() => confirm.mutate(undefined, { onSettled: () => setOpened(false) })}
              className="pub-btn pub-btn--primary disabled:opacity-60"
            >
              {confirm.isPending ? 'Đang gửi…' : 'Đã nhận được đơn'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default function OrderDetailPage() {
  const { orderCode = '' } = useParams()
  const { data: o, isPending, isError, error } = useMyOrder(orderCode)

  let body
  if (o) {
    const placed = o.milestones.placedAt
    body = (
      <>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <h1 className="text-(length:--pub-text-xl) select-text">
                <EntityCode code={o.orderCode} size="display" />
              </h1>
              <CopyCodeButton code={o.orderCode} />
            </div>
          </div>
          <p className="text-(--pub-ink-muted)">
            {o.channel === 'ONLINE' ? 'Đặt online' : 'Tại tiệm'}
            {placed ? ` · ${dayjs(placed).format('DD/MM/YYYY HH:mm')}` : ''}
          </p>
        </div>
        <OrderStepper order={o} />
        {o.receiptConfirmable && (
          <div className="flex flex-col gap-3 rounded-(--pub-radius-xl) bg-(--pub-primary-soft) p-4 sm:flex-row sm:items-center sm:justify-between">
            <p>Đơn đang được giao tới anh/chị. Nhận được đồ rồi thì xác nhận giúp tiệm nhé.</p>
            <ConfirmReceivedButton orderCode={o.orderCode} />
          </div>
        )}
        <OrderLegs order={o} />
        <OrderItemLines order={o} />
        <OrderPaymentCard order={o} />
      </>
    )
  } else if (isPending) {
    body = <Skeleton h={320} radius="md" aria-hidden="true" />
  } else if (isError) {
    body = (
      <Notice
        title={
          toApiError(error).status === 404
            ? 'Không tìm thấy đơn này'
            : 'Không tải được đơn, vui lòng thử lại sau'
        }
      />
    )
  }

  return (
    <div className="pub-container flex max-w-4xl flex-col gap-4 py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: 'Tài khoản', to: PATHS.customerAccount },
          { label: 'Đơn của tôi', to: PATHS.customerAccount },
          { label: <EntityCode code={orderCode} size="md" /> },
        ]}
      />
      {body}
    </div>
  )
}
