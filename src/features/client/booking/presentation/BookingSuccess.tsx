import type { ReactNode } from 'react'
import { formatMoney, formatPhone } from '@/shared/common/lib/format'
import { useCustomerSessionStore } from '@/features/client/customer-account'
import { CopyButton } from '@mantine/core'
import { LuCheck, LuCircleCheck, LuCopy } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'
import { formatVnDateTime } from '../domain/appointment'
import { TIER_LABEL } from '../domain/draft'
import type { BookingIntakeResult, BookingOrder, BookingService } from '../domain/types'
import { ServiceSummaryList } from './ServiceSummaryList'
import { InfoTip } from './InfoTip'
import { SummaryRow as Row } from './SummaryRow'

interface BookingSuccessProps {
  result: BookingIntakeResult
  storePhone: string | null
  services: readonly BookingService[]
  onNewBooking: () => void
}

const joinAddress = (detail: string, area?: string | null) =>
  [detail, area].filter(Boolean).join(', ')
const fee = (v: number) => (v === 0 ? 'Miễn phí' : formatMoney(v))
const METHOD_LABEL = { AT_STORE: 'Tại tiệm', PICKUP: 'Lấy tận nơi', DELIVERY: 'Giao tận nơi' }

function Group({ title, info, children }: { title: string; info?: string; children: ReactNode }) {
  return (
    <section className="bk-panel flex flex-col gap-3">
      <h3 className="flex items-center gap-1 text-(length:--pub-text-lg)">
        {title}
        {info && <InfoTip label={info} />}
      </h3>
      {children}
    </section>
  )
}

function OrderCard({
  order: q,
  services,
}: {
  order: BookingOrder
  services: readonly BookingService[]
}) {
  const delivery = q.returnMethod === 'DELIVERY'
  const items = q.services.map((x) => ({
    key: x.serviceId,
    name: x.serviceName ?? `#${x.serviceId}`,
    priced: services.find((y) => y.id === x.serviceId),
  }))
  return (
    <section className="bk-panel flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h4 className="font-semibold">Dịch vụ</h4>
        <dl>
          <Row label="Hình thức giặt" value={TIER_LABEL[q.orderType]} />
        </dl>
        <ServiceSummaryList
          items={items}
          whites={q.washWhitesSeparately}
          express={q.orderType === 'EXPRESS'}
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-(--pub-border) pt-4">
        <h4 className="font-semibold">Nhận đồ</h4>
        <dl className="flex flex-col gap-3">
          <Row label="Hình thức" value={METHOD_LABEL[q.returnMethod]} />
          {delivery && q.deliveryAddress && (
            <Row label="Địa chỉ" value={joinAddress(q.deliveryAddress, q.deliveryAreaName)} />
          )}
          {delivery && <Row label="Phí giao đồ" value={fee(q.deliveryFee)} money />}
          {q.dueAt && <Row label="Giờ nhận lại" value={formatVnDateTime(q.dueAt)} numeric />}
        </dl>
      </div>
    </section>
  )
}

/** Màn thành công: mọi số liệu lấy từ OnlineBookingResponse của BE, không tính lại ở FE. */
export function BookingSuccess({
  result,
  storePhone,
  services,
  onNewBooking,
}: BookingSuccessProps) {
  const loggedIn = useCustomerSessionStore((s) => s.status === 'authenticated')
  const r = result.orders[0]

  return (
    <section className="bk-card flex max-w-3xl flex-col gap-6" aria-live="polite">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-2">
          <span className="pub-icon-tile size-14!" aria-hidden="true">
            <LuCircleCheck size={30} />
          </span>
          <h2 className="text-(length:--pub-text-xl)">Tiệm đã nhận yêu cầu của anh/chị</h2>
          <p className="font-semibold">Tiệm sẽ gọi điện hoặc nhắn Zalo để xác nhận.</p>
          <div className="mt-2 flex w-full flex-col gap-3 rounded-(--pub-radius-xl) bg-(--pub-primary-soft) p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-(length:--pub-text-sm) font-semibold text-(--pub-ink-muted)">
                Mã đơn của anh/chị
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-(length:--pub-text-sm) font-medium text-amber-800">
                Chờ xác nhận
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="font-(family-name:--pub-font-mono) text-(length:--pub-text-xl) font-bold tracking-wide break-all text-(--pub-ink) sm:text-(length:--pub-text-2xl)">
                {r.orderCode}
              </span>
              <CopyButton value={r.orderCode}>
                {({ copied, copy }) => (
                  <button
                    type="button"
                    onClick={copy}
                    aria-label={`Sao chép mã ${r.orderCode}`}
                    className="pub-btn pub-btn--ghost"
                  >
                    {copied ? (
                      <LuCheck size={18} aria-hidden="true" />
                    ) : (
                      <LuCopy size={18} aria-hidden="true" />
                    )}
                    <span aria-live="polite">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                )}
              </CopyButton>
            </div>
            <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
              Dùng mã này để tra cứu đơn.
            </p>
          </div>
          {!result.created && (
            <p role="status" className="font-semibold">
              Lượt đặt này đã được ghi nhận trước đó
            </p>
          )}
        </div>

        <Group title="Gửi đồ">
          <dl className="flex flex-col gap-3">
            <Row label="Hình thức" value={METHOD_LABEL[r.dropoffMethod]} />
            {r.pickupAddress && (
              <Row label="Địa chỉ" value={joinAddress(r.pickupAddress, r.pickupAreaName)} />
            )}
            {r.dropoffMethod === 'PICKUP' && (
              <Row label="Phí lấy đồ" value={fee(r.pickupFee)} money />
            )}
            <Row
              label={r.dropoffMethod === 'AT_STORE' ? 'Giờ mang đến tiệm' : 'Giờ tiệm đến lấy'}
              value={formatVnDateTime(r.appointmentAt)}
              numeric
            />
          </dl>
        </Group>

        <OrderCard order={r} services={services} />

        <Group title="Liên hệ">
          <dl className="flex flex-col gap-3">
            <Row label="Họ và tên" value={r.contactName} />
            <Row label="Số điện thoại" value={formatPhone(r.contactPhone)} numeric />
            {r.note && <Row label="Ghi chú" value={r.note} />}
          </dl>
        </Group>

        <p className="text-(--pub-ink-muted)">
          Cần hỏi hoặc hủy yêu cầu, anh/chị vui lòng gọi tiệm
          {storePhone ? ` theo số ${formatPhone(storePhone)}` : ''}.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {loggedIn && (
            <Link
              to={PATHS.customerAccount}
              className="pub-btn pub-btn--primary pub-btn--lg w-full sm:order-last"
            >
              Xem đơn của tôi
            </Link>
          )}
          <button
            type="button"
            onClick={onNewBooking}
            className={`pub-btn pub-btn--lg w-full ${loggedIn ? 'pub-btn--ghost' : 'pub-btn--primary'}`}
          >
            Đặt đơn mới
          </button>
        </div>
      </div>
    </section>
  )
}
