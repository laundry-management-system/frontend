import { Skeleton } from '@mantine/core'
import { LuMapPin } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'
import { usePublicStore } from '../application/queries/usePublicStore'
import { CallButton } from './CallButton'
import { ZaloLink } from './ZaloLink'

/** Lời kêu gọi cuối trang: có số thì gọi / Zalo, chưa có số thì địa chỉ, thiếu cả hai thì mời ghé tiệm. */
export function FinalCta() {
  const { data, isPending } = usePublicStore()
  const phone = data?.phone ?? null
  const address = data?.address ?? null

  let action
  if (isPending) action = <Skeleton h={52} w={220} radius="sm" className="opacity-20" />
  else if (phone)
    action = (
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <CallButton phone={phone} size="lg" />
        <ZaloLink phone={phone} asButton />
      </div>
    )
  else if (address)
    action = (
      <p className="flex items-start gap-2 text-(length:--pub-text-lg) font-semibold">
        <LuMapPin size={22} className="mt-0.5 flex-none" aria-hidden="true" />
        <span>Ghé tiệm tại {address}</span>
      </p>
    )
  else action = <p className="text-(length:--pub-text-lg) font-semibold">Ghé tiệm để được tư vấn</p>

  return (
    <section aria-labelledby="loi-moi-title" className="pub-section">
      <div className="pub-container">
        <div className="pub-on-dark relative overflow-hidden rounded-(--pub-radius-xl) bg-(--pub-primary) px-6 py-12 text-(--pub-on-primary) sm:px-12 sm:py-16 lg:px-16">
          <span
            aria-hidden="true"
            className="absolute -right-24 -bottom-40 h-96 w-72 rounded-t-full bg-(--pub-orchid) sm:right-12 sm:-bottom-24"
          />
          <span
            aria-hidden="true"
            className="absolute -right-28 -bottom-44 h-[26rem] w-80 rounded-t-full border border-white/40 sm:right-8 sm:-bottom-28"
          />
          <div className="relative flex max-w-2xl flex-col items-start gap-6">
            <h2 id="loi-moi-title" className="pub-h2 text-(--pub-on-primary)!">
              Sẵn sàng cho một mẻ đồ <span className="text-(--pub-accent)">thơm tho</span>?
            </h2>
            <p className="max-w-xl text-(length:--pub-text-lg) text-white/85">
              Gọi hoặc nhắn cho tiệm để hỏi giá, hẹn lấy đồ tận nơi hay đơn giản là ghé qua.
            </p>
            <Link to={PATHS.customerBooking} className="pub-btn pub-btn--accent pub-btn--lg">
              Đặt đơn ngay
            </Link>
            {action}
          </div>
        </div>
      </div>
    </section>
  )
}
