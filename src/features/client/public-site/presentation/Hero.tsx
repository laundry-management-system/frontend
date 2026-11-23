import { Skeleton } from '@mantine/core'
import { LuArrowDown, LuCheck } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'
import { useHeroRef } from '../application/heroRef'
import { usePublicServiceAreas } from '../application/queries/usePublicServiceAreas'
import { usePublicStore } from '../application/queries/usePublicStore'
import { useNow } from '../application/useNow'
import { openStatus } from '../domain/openStatus'
import { CallButton } from './CallButton'
import { HeroPhoto } from './HeroPhoto'

const PROMISES = ['Cân, đếm rõ ràng khi nhận', 'Giặt xong tiệm báo ngay', 'Thanh toán khi nhận đồ']

function OpenStatusPill() {
  const { data, isPending } = usePublicStore()
  const now = useNow()
  if (isPending) return <Skeleton h={34} w={260} radius="xl" />
  // Lỗi tải: ẩn hẳn, không đoán trạng thái
  if (!data) return null
  const s = openStatus(now, data.openingTime, data.closingTime)
  return (
    <p className="pub-eyebrow mb-0! flex-wrap gap-x-2">
      <span
        aria-hidden="true"
        className={`size-2.5 rounded-full ${s.isOpen ? 'bg-(--pub-accent)' : 'bg-(--pub-ink-muted)'}`}
      />
      <strong className={`font-semibold ${s.isOpen ? 'text-(--pub-success)' : ''}`}>
        {s.title}
      </strong>
      <span className="text-(--pub-ink-muted)">· {s.detail}</span>
    </p>
  )
}

/** Phần mở đầu: tiêu đề, mô tả và ảnh render ngay; trạng thái mở cửa và nút gọi chờ dữ liệu cửa hàng. */
export function Hero() {
  const heroRef = useHeroRef()
  const { data } = usePublicStore()
  const phone = data?.phone ?? null
  // Chỉ hứa lấy, giao tận nơi khi tiệm thật sự có khu vực phục vụ
  const door = !!usePublicServiceAreas().data?.length

  return (
    <section
      id="intro"
      ref={heroRef}
      aria-labelledby="intro-title"
      data-enter
      className="flex min-h-[calc(100svh-4.5rem)] items-center overflow-hidden bg-(image:--pub-hero-gradient) pt-10 pb-16 md:pt-12 md:pb-16"
    >
      <div className="pub-container grid items-center gap-14 md:grid-cols-[1.15fr_1fr] md:gap-10">
        <div className="pub-rise flex flex-col items-start gap-6">
          <div className="min-h-9">
            <OpenStatusPill />
          </div>
          <h1
            id="intro-title"
            className="max-w-[16ch] text-(length:--pub-text-hero) text-(--pub-ink)"
          >
            Giặt sạch, sấy thơm, <span className="pub-accent-word">gấp gọn</span> giúp bạn
          </h1>
          <p className="max-w-xl text-(length:--pub-text-lg) text-(--pub-ink-muted)">
            {door
              ? 'Mang đồ đến tiệm hoặc gọi để tiệm lấy tận nơi. Tiệm cân, đếm và ghi biên nhận ngay khi nhận đồ, giặt xong báo để bạn qua lấy hoặc giao lại tận nhà.'
              : 'Mang đồ đến tiệm, tiệm cân, đếm và ghi biên nhận ngay khi nhận đồ, giặt xong báo để bạn qua lấy.'}
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to={PATHS.customerBooking} className="pub-btn pub-btn--primary pub-btn--lg">
              Đặt đơn ngay
            </Link>
            <CallButton phone={phone} size="lg" />
            <a href="#pricing" className="pub-btn pub-btn--ghost pub-btn--lg">
              Xem bảng giá
              <LuArrowDown size={18} aria-hidden="true" />
            </a>
          </div>
          <ul className="flex flex-col gap-2 text-(--pub-ink-muted) sm:flex-row sm:flex-wrap sm:gap-x-6">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="grid size-5 flex-none place-items-center rounded-full bg-(--pub-accent) text-(--pub-on-accent)"
                >
                  <LuCheck size={13} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <HeroPhoto />
      </div>
    </section>
  )
}
