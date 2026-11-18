import { TextInput } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { LuMapPin, LuPackageOpen, LuSearch, LuSearchX, LuTruck } from 'react-icons/lu'
import { filterAreas } from '../../domain/serviceAreas'
import type { PublicServiceArea } from '../../domain/types'
import { formatFee } from '../formatFee'

// Ít khu vực thì nhìn là thấy, không cần ô tìm
const SEARCH_MIN_AREAS = 7
const SEARCH_CLASSES = {
  input:
    'h-12! rounded-(--pub-radius-btn)! border-(--pub-border)! bg-(--pub-surface)! text-(length:--pub-text-md)! focus:border-(--pub-primary)!',
  section: 'text-(--pub-ink-muted)!',
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

export function AreaList({ areas }: { areas: readonly PublicServiceArea[] }) {
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
