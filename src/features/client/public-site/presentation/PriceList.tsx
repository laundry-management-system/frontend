import { Skeleton } from '@mantine/core'
import type { IconType } from 'react-icons'
import { LuShirt, LuSparkles, LuWashingMachine } from 'react-icons/lu'
import { UNIT_LABEL } from '../domain/types'
import { formatMoney, formatNumber, formatPhone } from '@/shared/common/lib/format'
import { usePublicServices } from '../application/queries/usePublicServices'
import { usePublicStore } from '../application/queries/usePublicStore'
import { usePublicWashModes } from '../application/queries/usePublicWashModes'
import { priceFor } from '../domain/estimate'
import type { PublicService, PublicWashMode } from '../domain/types'
import { SectionError } from './SectionError'
import { SectionHeading } from './SectionHeading'

const TITLE_ID = 'pricing-title'
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

interface PriceTableProps {
  services: PublicService[]
  modes: PublicWashMode[]
  whitesFee: number | null
}

function PriceTable({ services, modes, whitesFee }: PriceTableProps) {
  const showWhites = !!whitesFee && services.some((s) => s.whitesApplicable)
  return (
    <>
      <div className="pub-card overflow-x-auto">
        <table className="w-full min-w-120 text-left">
          <thead>
            <tr className="border-b border-(--pub-border)">
              <th scope="col" className="p-4 font-semibold">
                Dịch vụ
              </th>
              {modes.map((m) => (
                <th key={m.id} scope="col" className="p-4 text-right font-semibold">
                  {m.name}
                  <span className="block text-(length:--pub-text-sm) font-normal text-(--pub-ink-muted)">
                    Xong trong {m.completionHours} giờ
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => {
              const Icon = UNIT_ICON[s.unit]
              const unit = UNIT_LABEL[s.unit]
              return (
                <tr key={`${i}-${s.name}`} className="border-b border-(--pub-border) last:border-0">
                  <th scope="row" className="p-4 font-semibold">
                    <span className="flex items-center gap-3">
                      <Icon size={20} className="flex-none" aria-hidden="true" />
                      <span>
                        {s.name}
                        {s.minQuantity > 0 && (
                          <span className="block text-(length:--pub-text-sm) font-normal text-(--pub-ink-muted)">
                            Tối thiểu {formatNumber(s.minQuantity)} {unit}
                          </span>
                        )}
                      </span>
                    </span>
                  </th>
                  {modes.map((m) => {
                    const price = priceFor(s, m.id)
                    return (
                      <td key={m.id} className="p-4 text-right tabular-nums">
                        {price === null ? (
                          <span aria-label="Không áp dụng">—</span>
                        ) : (
                          <>
                            {formatMoney(price)}
                            <span className="text-(--pub-ink-muted)">/{unit}</span>
                          </>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Phí 0đ thì không có gì để báo nên không hiện */}
      {showWhites && (
        <p className="mt-4 rounded-(--pub-radius-md) bg-(--pub-accent-soft) px-3 py-2 text-(length:--pub-text-sm)">
          Đồ trắng giặt riêng: phụ phí {formatMoney(whitesFee)} mỗi đơn
        </p>
      )}
    </>
  )
}

/** Dịch vụ và bảng giá: các dịch vụ đang hoạt động, đúng thứ tự trên màn Bảng giá. */
export function PriceList() {
  const services = usePublicServices()
  const modes = usePublicWashModes()
  const store = usePublicStore()
  const phone = store.data?.phone ?? null
  const handleRetry = () => {
    services.refetch()
    modes.refetch()
  }

  let body
  if (services.isPending || modes.isPending) body = <PriceListSkeleton />
  else if (services.isError || modes.isError)
    body = <SectionError what="bảng giá" onRetry={handleRetry} />
  else if (services.data.length === 0 || modes.data.length === 0)
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
      <PriceTable
        services={services.data}
        modes={modes.data}
        whitesFee={store.data?.whitesFee ?? null}
      />
    )

  return (
    <section
      id="pricing"
      aria-labelledby={TITLE_ID}
      aria-busy={services.isPending || modes.isPending}
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
