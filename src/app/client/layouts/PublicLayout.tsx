import { Burger, Drawer, Skeleton } from '@mantine/core'
import { useDisclosure, useIntersection } from '@mantine/hooks'
import { type MouseEvent, type ReactNode, useRef } from 'react'
import { LuWashingMachine } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { AccountMenu } from '@/features/client/customer-account'
import { CallButton, HeroRefContext, usePublicStore } from '@/features/client/public-site'
import { PATHS } from '@/shared/common/config/paths'
import { SiteFooter } from './SiteFooter'
import { NAV, useAnchorNav, useScrollToHash, useSectionNav } from './useSectionNav'

const DRAWER_CLASSES = {
  content: 'bg-(--pub-bg)!',
  header: 'bg-(--pub-bg)!',
  title: 'font-(family-name:--pub-font-display)! text-(length:--pub-text-xl)! font-semibold!',
  close: 'size-11!',
}

function NavLinks({ onNavigate }: { onNavigate: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  return NAV.map((n) => (
    <li key={n.id}>
      <a
        href={`${PATHS.landing}#${n.id}`}
        data-target={n.id}
        onClick={onNavigate}
        className="flex min-h-(--pub-touch) items-center rounded-(--pub-radius-btn) px-4 text-(length:--pub-text-sm) font-semibold tracking-wide text-(--pub-ink) uppercase underline decoration-transparent decoration-2 underline-offset-8 transition-colors duration-(--pub-duration) hover:decoration-(--pub-accent)"
      >
        {n.label}
      </a>
    </li>
  ))
}

/** Khung trang công khai cho khách: không dùng AppShell, sidebar hay bất kỳ phần nào của giao diện quản trị. */
export function PublicLayout({ children }: { children: ReactNode }) {
  const store = usePublicStore()
  const data = store.data
  const phone = data?.phone ?? null
  const [drawerOpened, drawer] = useDisclosure(false)
  const { ref: heroRef, entry: heroEntry } = useIntersection<HTMLElement>()
  const pendingTarget = useRef<string | null>(null)
  const goTo = useSectionNav()
  const handleAnchorNav = useAnchorNav()
  useScrollToHash()

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
    if (id) setTimeout(() => goTo(id))
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
          href={`${PATHS.landing}#intro`}
          data-target="intro"
          onClick={handleAnchorNav}
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
        <Link to={PATHS.customerBooking} className="pub-btn pub-btn--primary hidden lg:inline-flex">
          Đặt đơn ngay
        </Link>
        <div className="hidden lg:block">
          <CallButton phone={phone} />
        </div>
        <div className="hidden lg:block">
          <AccountMenu />
        </div>
        <Burger
          opened={drawerOpened}
          onClick={drawer.toggle}
          aria-label={drawerOpened ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={drawerOpened}
          aria-controls="mobile-menu"
          className="size-11! lg:hidden!"
        />
      </div>
    </header>
  )

  const mobileMenu = (
    <Drawer
      id="mobile-menu"
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
      <div className="mt-6 flex flex-col gap-3">
        <Link to={PATHS.customerBooking} className="pub-btn pub-btn--primary pub-btn--lg w-full">
          Đặt đơn ngay
        </Link>
        <CallButton phone={phone} size="lg" fullWidth />
        <AccountMenu />
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
      <a href="#content"className="pub-skip-link">
        Bỏ qua tới nội dung chính
      </a>
      {header}
      <main id="content" tabIndex={-1} className="outline-none">
        <HeroRefContext value={heroRef}>{children}</HeroRefContext>
      </main>
      <SiteFooter />
      {callBar}
      {mobileMenu}
    </div>
  )
}
