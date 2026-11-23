import type { ReactNode } from 'react'
import { formatMoney, formatPhone } from '@/shared/common/lib/format'
import { formatVnDateTime, toAppointmentIso } from '../../domain/appointment'
import { useBookingFormContext } from '../../application/bookingForm'
import type { BookingArea, BookingService } from '../../domain/types'
import { hasWhitesService, TIER_LABEL, type BookingStep } from '../../domain/draft'
import { ServiceSummaryList } from '../ServiceSummaryList'
import { SummaryRow as Row } from '../SummaryRow'

interface StepReviewProps {
  services: readonly BookingService[]
  areas: readonly BookingArea[]
  onEdit: (step: BookingStep) => void
}

const joinAddress = (detail: string, area?: string | null) => [detail.trim(), area].filter(Boolean).join(', ')
const fee = (v: number) => (v === 0 ? 'Miễn phí' : formatMoney(v))
const DROPOFF_LABEL = { AT_STORE: 'Mang đến tiệm', PICKUP: 'Lấy tận nơi' }
const RETURN_LABEL = { AT_STORE: 'Nhận tại tiệm', DELIVERY: 'Giao tận nơi' }

function EditButton({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <button type="button" onClick={onEdit} className="pub-btn pub-btn--ghost" aria-label={`Sửa ${title.toLowerCase()}`}>
      Sửa
    </button>
  )
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <section className="bk-panel flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-(length:--pub-text-lg)">{title}</h3>
        <EditButton title={title} onEdit={onEdit} />
      </div>
      {children}
    </section>
  )
}

function Direction({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 not-first:border-t not-first:border-(--pub-border) not-first:pt-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold">{title}</h4>
        <EditButton title={title} onEdit={onEdit} />
      </div>
      <dl className="flex flex-col gap-3">{children}</dl>
    </div>
  )
}

/** Bước 5: bốn nhóm theo thứ tự các bước, mỗi nhóm có nút Sửa về đúng bước. */
export function StepReview({ services, areas, onEdit }: StepReviewProps) {
  const v = useBookingFormContext().getValues()
  const pickup = v.dropoffMethod === 'PICKUP'
  const delivery = v.returnMethod === 'DELIVERY'
  const pickupArea = areas.find((a) => a.id === v.pickupAreaId)
  const deliveryArea = areas.find((a) => a.id === v.deliveryAreaId)
  const note = v.note.trim()
  const at = (d: string | null, h: number | null) =>
    d !== null && h !== null ? formatVnDateTime(toAppointmentIso(d, h)) : null
  const serviceItems = v.items.map((i) => {
    const svc = services.find((x) => x.id === i.serviceId)
    return { key: i.serviceId, name: svc?.name ?? '', priced: svc }
  })
  const returnAt = at(v.returnDate, v.returnHour)
  const pickupFee = pickup ? (pickupArea?.pickupFee ?? 0) : 0
  const deliveryFee = delivery ? (deliveryArea?.deliveryFee ?? 0) : 0

  return (
    <div className="flex flex-col gap-4">
      <Section title="Dịch vụ" onEdit={() => onEdit(1)}>
        <dl className="flex flex-col gap-3">
          <Row label="Hình thức" value={TIER_LABEL[v.orderType]} />
        </dl>
        <ServiceSummaryList
          items={serviceItems}
          express={v.orderType === 'EXPRESS'}
          whites={v.washWhitesSeparately && hasWhitesService(v.items, services)}
        />
      </Section>

      <section className="bk-panel flex flex-col gap-4">
        <h3 className="text-(length:--pub-text-lg)">Giao nhận</h3>
        <Direction title="Gửi đồ" onEdit={() => onEdit(2)}>
          <Row label="Hình thức" value={DROPOFF_LABEL[v.dropoffMethod]} />
          {pickup && <Row label="Địa chỉ" value={joinAddress(v.pickupAddress, pickupArea?.name)} />}
          {pickup && pickupArea && <Row label="Phí lượt lấy" value={fee(pickupFee)} money />}
          <Row
            label={pickup ? 'Giờ tiệm đến lấy' : 'Giờ mang đến tiệm'}
            value={at(v.appointmentDate, v.appointmentHour) ?? ''}
            numeric
          />
        </Direction>
        <Direction title="Nhận đồ" onEdit={() => onEdit(2)}>
          <Row label="Hình thức" value={RETURN_LABEL[v.returnMethod]} />
          {delivery && <Row label="Địa chỉ" value={joinAddress(v.deliveryAddress, deliveryArea?.name)} />}
          {delivery && deliveryArea && <Row label="Phí lượt giao" value={fee(deliveryFee)} money />}
          {returnAt && <Row label="Giờ nhận lại" value={returnAt} numeric />}
        </Direction>
      </section>

      <Section title="Liên hệ" onEdit={() => onEdit(4)}>
        <dl className="flex flex-col gap-3">
          <Row label="Họ và tên" value={v.contactName.trim()} />
          <Row label="Số điện thoại" value={formatPhone(v.contactPhone)} numeric />
          {note && <Row label="Ghi chú" value={note} />}
        </dl>
      </Section>
    </div>
  )
}
