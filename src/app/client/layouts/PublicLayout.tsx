import { formatPhone } from '@/shared/common/lib/format'
import { Burger, Drawer, Skeleton } from '@mantine/core'
import { useDisclosure, useIntersection } from '@mantine/hooks'
import { type CSSProperties, type MouseEvent, type ReactNode, useRef } from 'react'
import { LuClock, LuLogIn, LuMapPin, LuPhone, LuWashingMachine } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import {
  CallButton,
  HeroRefContext,
  SectionError,
  usePublicStore,
  ZaloLink,
} from '@/features/client/public-site'
import { PATHS } from '@/shared/common/config/paths'

const NAV = [
  { id: 'bang-gia', label: 'Dịch vụ và bảng giá' },
  { id: 'khu-vuc', label: 'Khu vực phục vụ' },
  { id: 'lien-he', label: 'Liên hệ' },
] as const

const DRAWER_CLASSES = {
  content: 'bg-(--pub-bg)!',
  header: 'bg-(--pub-bg)!',
  title: 'font-(family-name:--pub-font-display)! text-(length:--pub-text-xl)! font-semibold!',
  close: 'size-11!',
}

/** Cuộn tới section rồi chuyển focus vào tiêu đề của nó, để bàn phím và trình đọc màn hình đi theo. */
function goToSection(id: string) {
  const section = document.getElementById(id)
  if (!section) return
  section.scrollIntoView()
  section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  history.replaceState(null, '', `#${id}`)
}

function handleAnchorNav(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  goToSection(e.currentTarget.dataset.target!)
}

function NavLinks({ onNavigate }: { onNavigate: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  return NAV.map((n) => (
    <li key={n.id}>
      <a
        href={`#${n.id}`}
        data-target={n.id}
        onClick={onNavigate}
        className="flex min-h-(--pub-touch) items-center rounded-(--pub-radius-btn) px-4 text-(length:--pub-text-sm) font-semibold tracking-wide text-(--pub-ink) uppercase underline decoration-transparent decoration-2 underline-offset-8 transition-colors duration-(--pub-duration) hover:decoration-(--pub-accent)"
      >
        {n.label}
      </a>
    </li>
  ))
}

const FOOTER_LINKS = NAV.filter((n) => n.id !== 'lien-he')

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

function SiteFooter() {
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
      id="lien-he"
      aria-labelledby="lien-he-title"
      className="scroll-mt-20 bg-(--pub-primary) text-(--pub-on-primary)"
    >
      <div className="pub-container pt-16 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-2">
            <h2
              id="lien-he-title"
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
                    href={`#${n.id}`}
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

/** Khung trang công khai cho khách: không dùng AppShell, sidebar hay bất kỳ phần nào của giao diện quản trị. */
export function PublicLayout({ children }: { children: ReactNode }) {
  const store = usePublicStore()
  const data = store.data
  const phone = data?.phone ?? null
  const [drawerOpened, drawer] = useDisclosure(false)
  const { ref: heroRef, entry: heroEntry } = useIntersection<HTMLElement>()
  const pendingTarget = useRef<string | null>(null)

  const heroOut = heroEntry ? !heroEntry.isIntersecting : false
  const showCallBar = !!phone && heroOut && !drawerOpened

  // Drawer phải đóng xong (trả focus về Burger) rồi mới cuộn và chuyển focus tới section
  const handleDrawerNav = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    pendingTarget.current = e.currentTarget.dataset.target!
    drawer.close()
  }
  const handleDrawerClosed = () => {
    const id = pendingTarget.current
    pendingTarget.current = null
    if (id) setTimeout(() => goToSection(id))
  }

  const storeName = store.isPending ? (
    <Skeleton h={22} w={160} radius="xl" />
  ) : (
    <span className="font-(family-name:--pub-font-display) text-(length:--pub-text-xl) leading-tight font-semibold">
      {data?.name}
    </span>
  )

  const header = (
    <header className="sticky top-0 z-100 border-b border-(--pub-border) bg-(--pub-bg)/90 backdrop-blur-md">
      <div className="pub-container flex min-h-18 items-center gap-3 py-2">
        <a
          href="#mo-dau"
          className="mr-auto flex min-h-(--pub-touch) min-w-0 items-center gap-2.5 rounded-(--pub-radius-btn) text-(--pub-ink) no-underline"
        >
          <span
            aria-hidden="true"
            className="grid size-10 flex-none place-items-center rounded-t-full rounded-b-(--pub-radius-btn) bg-(--pub-accent) text-(--pub-on-accent)"
          >
            <LuWashingMachine size={22} />
          </span>
          {storeName}
          <span className="sr-only">, về đầu trang</span>
        </a>
        <nav aria-label="Menu chính" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            <NavLinks onNavigate={handleAnchorNav} />
          </ul>
        </nav>
        <div className="hidden lg:block">
          <CallButton phone={phone} />
        </div>
        <Burger
          opened={drawerOpened}
          onClick={drawer.toggle}
          aria-label={drawerOpened ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={drawerOpened}
          aria-controls="menu-di-dong"
          className="size-11! lg:hidden!"
        />
      </div>
    </header>
  )

  const mobileMenu = (
    <Drawer
      id="menu-di-dong"
      opened={drawerOpened}
      onClose={drawer.close}
      onExitTransitionEnd={handleDrawerClosed}
      position="right"
      size="xs"
      title={data?.name ?? 'Menu'}
      withinPortal={false}
      classNames={DRAWER_CLASSES}
    >
      <nav aria-label="Menu chính">
        <ul className="flex flex-col gap-1">
          <NavLinks onNavigate={handleDrawerNav} />
        </ul>
      </nav>
      <div className="mt-6">
        <CallButton phone={phone} size="lg" fullWidth />
      </div>
    </Drawer>
  )

  // Thanh gọi dính đáy chỉ dưới md; đứng sau nội dung chính trong thứ tự Tab và không bẫy focus
  const callBar = showCallBar && (
    <div className="pub-slide-up fixed inset-x-0 bottom-0 z-90 border-t border-(--pub-border) bg-(--pub-bg)/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-(--pub-shadow-lg) backdrop-blur-md md:hidden">
      <CallButton phone={phone} size="lg" fullWidth />
    </div>
  )

  return (
    <div
      data-surface="public"
      data-call-bar={phone ? '' : undefined}
      className={`min-h-dvh overflow-x-clip ${phone ? 'pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0' : ''}`}
    >
      <a href="#noi-dung" className="pub-skip-link">
        Bỏ qua tới nội dung chính
      </a>
      {header}
      <main id="noi-dung" tabIndex={-1} className="outline-none">
        <HeroRefContext value={heroRef}>{children}</HeroRefContext>
      </main>
      <SiteFooter />
      {callBar}
      {mobileMenu}
    </div>
  )
}
