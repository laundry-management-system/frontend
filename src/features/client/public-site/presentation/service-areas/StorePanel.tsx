import { formatPhone } from '@/shared/common/lib/format'
import type { ReactNode } from 'react'
import { LuNavigation, LuPhone, LuStore } from 'react-icons/lu'
import { usePublicStore } from '../../application/queries/usePublicStore'
import { directionsUrl, minFee } from '../../domain/serviceAreas'
import type { PublicServiceArea } from '../../domain/types'
import { formatFee } from '../formatFee'
import { RouteMap } from './RouteMap'

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-(--pub-radius-md) bg-(--pub-surface-alt) px-4 py-3">
      <dt className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">{label}</dt>
      <dd className="font-(family-name:--pub-font-display) text-(length:--pub-text-xl) font-semibold tabular-nums">
        {value}
      </dd>
    </div>
  )
}

export function StorePanel({ areas }: { areas: readonly PublicServiceArea[] }) {
  const { data } = usePublicStore()
  const address = data?.address ?? null
  const phone = data?.phone ?? null
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
          <Stat label="Khu vực phục vụ" value={areas.length} />
          <Stat label="Phí mỗi lượt từ" value={formatFee(minFee(areas))} />
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
