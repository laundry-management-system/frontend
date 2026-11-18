import { Skeleton } from '@mantine/core'
import type { IconType } from 'react-icons'
import { LuClock, LuRuler, LuShirt, LuSparkles, LuWashingMachine, LuZap } from 'react-icons/lu'
import { UNIT_LABEL } from '../domain/types'
import { expressParts } from './formatFee'
import { formatMoney, formatNumber, formatPhone } from '@/shared/common/lib/format'
import { usePublicServices } from '../application/queries/usePublicServices'
import { usePublicStore } from '../application/queries/usePublicStore'
import type { PublicService } from '../domain/types'
import { SectionError } from './SectionError'
import { SectionHeading } from './SectionHeading'

const TITLE_ID = 'bang-gia-title'
const TITLE = (
  <>
    Dịch vụ và <span className="pub-accent-word">bảng giá</span>
  </>
)
const UNIT_ICON: Record<PublicService['unit'], IconType> = {
  KG: LuWashingMachine,
  PIECE: LuShirt,
  SET: LuShirt,
  PRODUCT: LuSparkles,
}
const SKELETON_CARDS = [0, 1, 2, 3]

function PriceListSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {SKELETON_CARDS.map((i) => (
        <li key={i} className="pub-card p-6">
          <Skeleton h={48} w={48} radius="lg" />
          <Skeleton h={22} w="70%" mt={16} />
          <Skeleton h={32} w="45%" mt={12} />
          <Skeleton h={14} w="85%" mt={16} />
          <Skeleton h={14} w="60%" mt={8} />
        </li>
      ))}
    </ul>
  )
}

function ServiceCard({ service, whitesFee }: { service: PublicService; whitesFee: number | null }) {
  const Icon = UNIT_ICON[service.unit]
  const unit = UNIT_LABEL[service.unit]
  const express = expressParts(service)
  return (
    <li className="pub-card pub-card--lift pub-card--shine flex flex-col gap-3 p-6">
      <span className="pub-icon-tile" aria-hidden="true">
        <Icon size={24} />
      </span>
      <h3 className="text-(length:--pub-text-lg) font-semibold">{service.name}</h3>
      <p>
        <span className="font-(family-name:--pub-font-display) text-[1.75rem] font-semibold text-(--pub-ink) tabular-nums">
          {formatMoney(service.price)}
        </span>
        <span className="text-(--pub-ink-muted)">/{unit}</span>
      </p>
      <ul className="flex flex-col gap-1.5 border-t border-(--pub-border) pt-4 text-(--pub-ink-muted)">
        {service.minQuantity > 0 && (
          <li className="flex items-start gap-2">
            <LuRuler size={18} className="mt-0.5 flex-none" aria-hidden="true" />
            Tối thiểu {formatNumber(service.minQuantity)} {unit}
          </li>
        )}
        <li className="flex items-start gap-2">
          <LuClock size={18} className="mt-0.5 flex-none" aria-hidden="true" />
          Xong trong {service.standardHours} giờ
        </li>
        {express && (
          <li className="flex items-start gap-2">
            <LuZap
              size={18}
              className="mt-0.5 flex-none text-(--pub-accent-ink)"
              aria-hidden="true"
            />
            Giặt nhanh {express.surcharge}, xong trong {express.hours}
          </li>
        )}
      </ul>
      {/* Phí 0đ thì không có gì để báo nên không hiện */}
      {service.whitesApplicable && !!whitesFee && (
        <p className="mt-auto rounded-(--pub-radius-md) bg-(--pub-accent-soft) px-3 py-2 text-(length:--pub-text-sm)">
          Đồ trắng giặt riêng: phụ phí {formatMoney(whitesFee)} mỗi đơn
        </p>
      )}
    </li>
  )
}

/** Dịch vụ và bảng giá: các dịch vụ đang hoạt động, đúng thứ tự trên màn Bảng giá. */
export function PriceList() {
  const services = usePublicServices()
  const store = usePublicStore()
  const phone = store.data?.phone ?? null
  const handleRetry = () => services.refetch()

  let body
  if (services.isPending) body = <PriceListSkeleton />
  else if (services.isError) body = <SectionError what="bảng giá" onRetry={handleRetry} />
  else if (services.data.length === 0)
    body = (
      <div className="pub-card p-6">
        <p className="font-medium">Tiệm đang cập nhật bảng giá, vui lòng gọi để được báo giá.</p>
        {phone && (
          <a href={`tel:${phone}`} className="pub-link text-(length:--pub-text-lg)">
            {formatPhone(phone)}
          </a>
        )}
      </div>
    )
  else
    body = (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.data.map((s, i) => (
          <ServiceCard
            key={`${i}-${s.name}`}
            service={s}
            whitesFee={store.data?.whitesFee ?? null}
          />
        ))}
      </ul>
    )

  return (
    <section
      id="bang-gia"
      aria-labelledby={TITLE_ID}
      aria-busy={services.isPending}
      className="pub-section"
    >
      <div className="pub-container">
        <SectionHeading id={TITLE_ID} eyebrow="Bảng giá" title={TITLE}>
          Giá niêm yết rõ ràng, tiệm cân hoặc đếm đồ ngay khi nhận.
        </SectionHeading>
        {body}
      </div>
    </section>
  )
}
