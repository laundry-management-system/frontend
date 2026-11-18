import { Skeleton } from '@mantine/core'
import { LuMapPin, LuPackageOpen, LuPhone, LuStore, LuTruck } from 'react-icons/lu'
import { formatPhone } from '@/features/customers'
import { usePublicServiceAreas } from '../application/queries/usePublicServiceAreas'
import { usePublicStore } from '../application/queries/usePublicStore'
import type { PublicServiceArea } from '../domain/types'
import { formatFee } from './formatFee'
import { SectionError } from './SectionError'
import { SectionHeading } from './SectionHeading'

const TITLE_ID = 'khu-vuc-title'
const SKELETON_ROWS = [0, 1, 2]

function ServiceAreasSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {SKELETON_ROWS.map((i) => (
        <li key={i} className="pub-card flex flex-col gap-3 p-5">
          <Skeleton h={22} w="60%" />
          <Skeleton h={16} w="80%" />
          <Skeleton h={16} w="70%" />
        </li>
      ))}
    </ul>
  )
}

function Fee({ label, fee, icon: Icon }: { label: string; fee: number; icon: typeof LuTruck }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-(--pub-ink-muted)">
        <Icon size={18} className="flex-none" aria-hidden="true" />
        {label}
      </dt>
      <dd
        className={`font-bold tabular-nums ${fee === 0 ? 'text-(--pub-success)' : 'text-(--pub-ink)'}`}
      >
        {formatFee(fee)}
      </dd>
    </div>
  )
}

function AreaCard({ area }: { area: PublicServiceArea }) {
  return (
    <li className="pub-card flex flex-col gap-3 p-6">
      <h3 className="flex items-start gap-2 text-(length:--pub-text-lg) font-semibold">
        <LuMapPin
          size={20}
          className="mt-0.5 flex-none text-(--pub-accent-ink)"
          aria-hidden="true"
        />
        <span className="min-w-0">{area.name}</span>
      </h3>
      <dl className="flex flex-col gap-1.5">
        <Fee label="Phí một lượt lấy" fee={area.pickupFee} icon={LuPackageOpen} />
        <Fee label="Phí một lượt giao" fee={area.deliveryFee} icon={LuTruck} />
      </dl>
    </li>
  )
}

/** Địa chỉ và số gọi của tiệm, phần nào chưa nhập thì bỏ. */
function StoreContact({ address, phone }: { address: string | null; phone: string | null }) {
  if (!address && !phone) return null
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6">
      {address && (
        <p className="flex items-start gap-2">
          <LuStore size={18} className="mt-1 flex-none" aria-hidden="true" />
          <span>{address}</span>
        </p>
      )}
      {phone && (
        <a href={`tel:${phone}`} className="pub-link">
          <LuPhone size={18} aria-hidden="true" />
          {formatPhone(phone)}
        </a>
      )}
    </div>
  )
}

/** Khu vực lấy, giao tận nơi đang phục vụ, theo thứ tự tiệm thêm vào. */
export function ServiceAreas() {
  const areas = usePublicServiceAreas()
  const store = usePublicStore()
  const address = store.data?.address ?? null
  const phone = store.data?.phone ?? null
  const handleRetry = () => areas.refetch()

  let body
  if (areas.isPending) body = <ServiceAreasSkeleton />
  else if (areas.isError) body = <SectionError what="khu vực phục vụ" onRetry={handleRetry} />
  else if (areas.data.length === 0)
    body = (
      <div className="pub-card flex flex-col gap-3 p-6">
        <p className="flex items-start gap-3 font-semibold">
          <span className="pub-icon-tile" aria-hidden="true">
            <LuStore size={24} />
          </span>
          <span className="self-center">Hiện tiệm chỉ nhận và trả đồ tại tiệm.</span>
        </p>
        <StoreContact address={address} phone={phone} />
      </div>
    )
  else
    body = (
      <>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.data.map((a, i) => (
            <AreaCard key={`${i}-${a.name}`} area={a} />
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2 rounded-(--pub-radius-lg) bg-(--pub-accent-soft) p-6">
          <p className="font-semibold">
            Ở ngoài các khu vực trên? Bạn có thể mang đồ đến tiệm
            {phone ? ' hoặc gọi để tiệm hỗ trợ.' : '.'}
          </p>
          <StoreContact address={address} phone={phone} />
        </div>
      </>
    )

  return (
    <section
      id="khu-vuc"
      aria-labelledby={TITLE_ID}
      aria-busy={areas.isPending}
      className="pub-section"
    >
      <div className="pub-container">
        <SectionHeading id={TITLE_ID} eyebrow="Giao nhận" title="Khu vực phục vụ">
          {areas.data?.length
            ? 'Tiệm lấy đồ và giao trả tận nơi trong các khu vực dưới đây.'
            : null}
        </SectionHeading>
        {body}
      </div>
    </section>
  )
}
