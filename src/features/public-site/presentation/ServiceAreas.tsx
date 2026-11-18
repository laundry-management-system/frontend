import { Skeleton, TextInput } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import {
  LuMapPin,
  LuNavigation,
  LuPackageOpen,
  LuPhone,
  LuSearch,
  LuSearchX,
  LuStore,
  LuTruck,
} from 'react-icons/lu'
import { formatPhone } from '@/features/customers'
import { usePublicServiceAreas } from '../application/queries/usePublicServiceAreas'
import { usePublicStore } from '../application/queries/usePublicStore'
import { directionsUrl, filterAreas, minFee } from '../domain/serviceAreas'
import type { PublicServiceArea } from '../domain/types'
import { formatFee } from './formatFee'
import { SectionError } from './SectionError'
import { SectionHeading } from './SectionHeading'

const TITLE_ID = 'khu-vuc-title'
const SKELETON_ROWS = [0, 1, 2, 3]
// Ít khu vực thì nhìn là thấy, không cần ô tìm
const SEARCH_MIN_AREAS = 7
const SEARCH_CLASSES = {
  input:
    'h-12! rounded-(--pub-radius-btn)! border-(--pub-border)! bg-(--pub-surface)! text-(length:--pub-text-md)! focus:border-(--pub-primary)!',
  section: 'text-(--pub-ink-muted)!',
}

/** Bản đồ minh hoạ: tiệm ở giữa, vòng phục vụ và tuyến giao tới nhà khách. Không theo toạ độ thật. */
function RouteMap() {
  return (
    <div className="pub-map h-52 sm:h-60" aria-hidden="true">
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="size-full">
        <g className="fill-none stroke-(--pub-surface)" strokeLinecap="round">
          <path d="M-10 70 C 120 60, 220 110, 410 90" strokeWidth="12" />
          <path d="M150 -10 C 160 90, 120 170, 140 250" strokeWidth="10" />
          <path d="M260 -10 L 300 250" strokeWidth="8" />
          <path d="M-10 190 C 100 200, 250 160, 410 200" strokeWidth="6" />
        </g>
        <g className="fill-none stroke-(--pub-accent)">
          <circle cx="150" cy="120" r="46" strokeWidth="1.5" opacity="0.5" />
          <circle cx="150" cy="120" r="88" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6" />
        </g>
        <path
          d="M150 120 C 200 120, 220 70, 300 72"
          className="fill-none stroke-(--pub-orchid)"
          strokeWidth="3"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
        <g transform="translate(300 72)">
          <circle r="14" className="fill-(--pub-orchid)" opacity="0.2" />
          <circle r="6" className="fill-(--pub-orchid) stroke-(--pub-surface)" strokeWidth="2.5" />
        </g>
        <g transform="translate(150 120)">
          <circle r="22" className="fill-(--pub-accent)" opacity="0.25" />
          <path
            d="M0 10 C -10 0, -13 -6, -13 -12 A 13 13 0 0 1 13 -12 C 13 -6, 10 0, 0 10 Z"
            className="fill-(--pub-primary)"
            transform="translate(0 -6)"
          />
          <circle cy="-18" r="4.5" className="fill-(--pub-accent)" />
        </g>
      </svg>
    </div>
  )
}

interface StorePanelProps {
  areas: readonly PublicServiceArea[]
  address: string | null
  phone: string | null
}

function StorePanel({ areas, address, phone }: StorePanelProps) {
  return (
    <div className="pub-card flex flex-col overflow-hidden lg:sticky lg:top-24">
      <RouteMap />
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start gap-3">
          <span className="pub-icon-tile" aria-hidden="true">
            <LuStore size={22} />
          </span>
          <div className="min-w-0 self-center">
            <p className="font-semibold">Xuất phát từ tiệm</p>
            {address && <p className="text-(--pub-ink-muted)">{address}</p>}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-(--pub-radius-md) bg-(--pub-surface-alt) px-4 py-3">
            <dt className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">Khu vực phục vụ</dt>
            <dd className="font-(family-name:--pub-font-display) text-(length:--pub-text-xl) font-semibold tabular-nums">
              {areas.length}
            </dd>
          </div>
          <div className="rounded-(--pub-radius-md) bg-(--pub-surface-alt) px-4 py-3">
            <dt className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">Phí mỗi lượt từ</dt>
            <dd className="font-(family-name:--pub-font-display) text-(length:--pub-text-xl) font-semibold tabular-nums">
              {formatFee(minFee(areas))}
            </dd>
          </div>
        </dl>
        {(address || phone) && (
          <div className="flex flex-wrap gap-x-6">
            {address && (
              <a
                href={directionsUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-link"
              >
                <LuNavigation size={18} aria-hidden="true" />
                Chỉ đường đến tiệm
                <span className="sr-only"> (mở Google Maps ở tab mới)</span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="pub-link">
                <LuPhone size={18} aria-hidden="true" />
                {formatPhone(phone)}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Fee({ label, fee, icon: Icon }: { label: string; fee: number; icon: typeof LuTruck }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="flex items-center gap-1.5 text-(--pub-ink-muted)">
        <Icon size={16} className="flex-none" aria-hidden="true" />
        {label}
      </dt>
      <dd
        className={`font-semibold tabular-nums ${fee === 0 ? 'text-(--pub-success)' : 'text-(--pub-ink)'}`}
      >
        {formatFee(fee)}
      </dd>
    </div>
  )
}

function AreaStop({ area }: { area: PublicServiceArea }) {
  return (
    <li className="pub-stop flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
      <h3 className="min-w-0 font-semibold [overflow-wrap:anywhere]">{area.name}</h3>
      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-(length:--pub-text-sm)">
        <Fee label="Lấy" fee={area.pickupFee} icon={LuPackageOpen} />
        <Fee label="Giao" fee={area.deliveryFee} icon={LuTruck} />
      </dl>
    </li>
  )
}

function AreaList({ areas }: { areas: readonly PublicServiceArea[] }) {
  const [query, setQuery] = useState('')
  const shown = filterAreas(areas, query)
  const searchable = areas.length >= SEARCH_MIN_AREAS

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value)
  const clearQuery = () => setQuery('')

  const search = searchable && (
    <div className="flex flex-col gap-2 border-b border-(--pub-border) p-4 sm:px-6">
      <TextInput
        value={query}
        onChange={handleQueryChange}
        placeholder="Tìm phường của bạn, ví dụ: Bến Thành"
        aria-label="Tìm khu vực"
        leftSection={<LuSearch size={18} />}
        autoComplete="off"
        classNames={SEARCH_CLASSES}
      />
      <p aria-live="polite" className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
        {query.trim() ? `${shown.length}/${areas.length} khu vực khớp` : `${areas.length} khu vực`}
      </p>
    </div>
  )

  const list =
    shown.length === 0 ? (
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <LuSearchX size={32} className="text-(--pub-ink-muted)" aria-hidden="true" />
        <p className="font-semibold">Chưa có khu vực nào khớp “{query.trim()}”</p>
        <p className="text-(--pub-ink-muted)">
          Bạn vẫn có thể mang đồ đến tiệm hoặc gọi để tiệm hỗ trợ.
        </p>
        <button type="button" onClick={clearQuery} className="pub-link">
          Xem tất cả khu vực
        </button>
      </div>
    ) : (
      <div
        role="region"
        aria-label="Danh sách khu vực phục vụ"
        tabIndex={0}
        className="max-h-[30rem] overflow-y-auto overscroll-contain px-4 sm:px-6"
      >
        <ol className="pub-stops">
          {shown.map((a, i) => (
            <AreaStop key={`${i}-${a.name}`} area={a} />
          ))}
        </ol>
      </div>
    )

  return (
    <div className="pub-card flex flex-col overflow-hidden">
      {search}
      {list}
      <p className="flex items-start gap-2 border-t border-(--pub-border) bg-(--pub-accent-soft) px-4 py-3 text-(length:--pub-text-sm) sm:px-6">
        <LuMapPin
          size={16}
          className="mt-0.5 flex-none text-(--pub-accent-ink)"
          aria-hidden="true"
        />
        Ở ngoài các khu vực trên? Bạn có thể mang đồ đến tiệm hoặc gọi để tiệm hỗ trợ.
      </p>
    </div>
  )
}

function ServiceAreasSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-hidden="true">
      <Skeleton h={360} radius="md" />
      <div className="pub-card flex flex-col gap-5 p-6">
        {SKELETON_ROWS.map((i) => (
          <Skeleton key={i} h={20} w={`${80 - i * 10}%`} />
        ))}
      </div>
    </div>
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
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <StorePanel areas={areas.data} address={address} phone={phone} />
        <AreaList areas={areas.data} />
      </div>
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
