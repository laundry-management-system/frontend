import { formatPhone } from '@/shared/common/lib/format'
import { Skeleton } from '@mantine/core'
import type { CSSProperties } from 'react'
import { LuClock, LuLogIn, LuMapPin, LuPhone } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { SectionError, usePublicStore, ZaloLink } from '@/features/client/public-site'
import { PATHS } from '@/shared/common/config/paths'
import { NAV, useAnchorNav } from './useSectionNav'

const FOOTER_LINKS = NAV.filter((n) => n.id !== 'contact')

// Ảnh thay thế có giấy phép trong public/landing; thay bằng ảnh chụp chính tiệm thì bỏ dòng ghi công này
const PHOTO_CREDITS = [
  [
    'TheGoodEndedHappily',
    'CC BY 4.0',
    'https://commons.wikimedia.org/wiki/File:Laundromat_in_Belgium.jpg',
  ],
  [
    'Santeri Viinamäki',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Clothes_in_green_laundry_basket.jpg',
  ],
  [
    'Gabbybratcher',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Folded_shirts_March_Photo_Challenge_-_Laundering.jpg',
  ],
  [
    'Petar Milošević',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Drum_of_a_washing_machine_(Bosch_Maxx_WFO_2440).jpg',
  ],
  ['HanSangYoon', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:HSY-_Folded_Towels.jpg'],
  ['Kotivalo', 'CC0', 'https://commons.wikimedia.org/wiki/File:Blue_laundry_on_rack_2.jpg'],
] as const

const photoCredits = PHOTO_CREDITS.map(([by, licence, page], i) => (
  <span key={page}>
    {i > 0 && ', '}
    <a
      href={page}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2"
    >
      {by}
    </a>{' '}
    ({licence})
  </span>
))

export function SiteFooter() {
  const handleAnchorNav = useAnchorNav()
  const store = usePublicStore()
  const data = store.data
  const phone = data?.phone ?? null
  const hours = data && `${data.openingTime} – ${data.closingTime}`
  const handleStoreRetry = () => store.refetch()

  const contact = store.isPending ? (
    <div aria-hidden="true" className="opacity-20">
      <Skeleton h={18} w="60%" />
      <Skeleton h={16} w="80%" mt={12} />
      <Skeleton h={16} w="40%" mt={12} />
    </div>
  ) : !data ? (
    <SectionError what="thông tin liên hệ" onRetry={handleStoreRetry} />
  ) : (
    <ul className="flex flex-col gap-2 text-white/85">
      <li className="text-(length:--pub-text-lg) font-semibold text-white">{data.name}</li>
      {data.address && (
        <li className="flex items-start gap-2">
          <LuMapPin size={18} className="mt-1 flex-none text-(--pub-accent)" aria-hidden="true" />
          {data.address}
        </li>
      )}
      <li className="flex items-start gap-2">
        <LuClock size={18} className="mt-1 flex-none text-(--pub-accent)" aria-hidden="true" />
        Mở cửa {hours} mỗi ngày
      </li>
      {phone && (
        <li className="flex flex-wrap items-center gap-x-4 text-white">
          <a href={`tel:${phone}`} className="pub-link">
            <LuPhone size={18} aria-hidden="true" />
            {formatPhone(phone)}
          </a>
          <ZaloLink phone={phone} />
        </li>
      )}
    </ul>
  )

  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-20 bg-(--pub-primary) text-(--pub-on-primary)"
    >
      <div className="pub-container pt-16 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-2">
            <h2
              id="contact-title"
              tabIndex={-1}
              className="text-(length:--pub-text-sm) font-semibold tracking-[0.14em] text-(--pub-accent) uppercase focus:outline-none"
            >
              Liên hệ
            </h2>
            {contact}
          </div>
          <nav aria-label="Liên kết trong trang">
            <h3 className="mb-2 text-(length:--pub-text-sm) font-semibold tracking-[0.14em] text-(--pub-accent) uppercase">
              Xem nhanh
            </h3>
            <ul>
              {FOOTER_LINKS.map((n) => (
                <li key={n.id}>
                  <a
                    href={`${PATHS.landing}#${n.id}`}
                    data-target={n.id}
                    onClick={handleAnchorNav}
                    className="pub-link font-normal text-white/85 no-underline decoration-(--pub-accent) hover:text-white hover:underline"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="mb-2 text-(length:--pub-text-sm) font-semibold tracking-[0.14em] text-(--pub-accent) uppercase">
              Dành cho nhân viên
            </h3>
            <Link
              to={PATHS.login}
              className="pub-link font-normal text-white/85 no-underline decoration-(--pub-accent) hover:text-white hover:underline"
            >
              <LuLogIn size={18} aria-hidden="true" />
              Đăng nhập nhân viên
            </Link>
          </div>
        </div>
        {data && (
          <p
            aria-hidden="true"
            style={{ '--chars': Math.max(data.name.length, 6) } as CSSProperties}
            className="pub-wordmark mt-16"
          >
            {data.name}
          </p>
        )}
        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-(length:--pub-text-sm) text-white/70 md:flex-row md:justify-between md:gap-8">
          <p className="flex-none">
            © {new Date().getFullYear()} {data?.name}
          </p>
          <p className="text-xs leading-relaxed text-white/55 md:max-w-3xl md:text-right">
            Ảnh minh hoạ từ Wikimedia Commons: {photoCredits}.
          </p>
        </div>
      </div>
    </footer>
  )
}
