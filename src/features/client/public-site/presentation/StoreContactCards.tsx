import { formatPhone } from '@/shared/common/lib/format'
import { Skeleton } from '@mantine/core'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { LuClock, LuMapPin, LuPhone } from 'react-icons/lu'
import { usePublicStore } from '../application/queries/usePublicStore'

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: IconType
  label: string
  children: ReactNode
}) {
  return (
    <li className="flex items-center gap-4 rounded-(--pub-radius-lg) bg-(--pub-bg) p-4">
      <span className="pub-icon-tile bg-(--pub-surface)!" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">{label}</p>
        <div className="font-semibold">{children}</div>
      </div>
    </li>
  )
}

/** Liên hệ và giờ mở cửa cạnh khung ước tính; phần nào chưa nhập thì bỏ, lỗi tải thì ẩn (footer có nút thử lại). */
export function StoreContactCards() {
  const { data, isPending } = usePublicStore()
  if (isPending)
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        <Skeleton h={80} radius="md" />
        <Skeleton h={80} radius="md" />
      </div>
    )
  if (!data) return null

  const contact = (data.phone || data.address) && (
    <div className="flex flex-col gap-4">
      <h3 className="text-(length:--pub-text-lg) font-semibold">Thông tin liên hệ</h3>
      <ul className="flex flex-col gap-3">
        {data.phone && (
          <InfoRow icon={LuPhone} label="Điện thoại">
            <a href={`tel:${data.phone}`} className="pub-link">
              {formatPhone(data.phone)}
            </a>
          </InfoRow>
        )}
        {data.address && (
          <InfoRow icon={LuMapPin} label="Địa chỉ">
            {data.address}
          </InfoRow>
        )}
      </ul>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      {contact}
      <div className="flex flex-col gap-4">
        <h3 className="text-(length:--pub-text-lg) font-semibold">Giờ mở cửa</h3>
        <ul>
          <InfoRow icon={LuClock} label="Tất cả các ngày trong tuần">
            <span className="tabular-nums">
              {data.openingTime} – {data.closingTime}
            </span>
          </InfoRow>
        </ul>
      </div>
    </div>
  )
}
