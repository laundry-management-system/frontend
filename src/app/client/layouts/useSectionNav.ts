import { type MouseEvent, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'

export const NAV = [
  { id: 'bang-gia', label: 'Dịch vụ và bảng giá' },
  { id: 'khu-vuc', label: 'Khu vực phục vụ' },
  { id: 'lien-he', label: 'Liên hệ' },
] as const

/** Cuộn tới section rồi chuyển focus vào tiêu đề của nó, để bàn phím và trình đọc màn hình đi theo. */
function goToSection(id: string) {
  const section = document.getElementById(id)
  if (!section) return false
  section.scrollIntoView()
  section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  history.replaceState(null, '', `#${id}`)
  return true
}

/** Section không có trên trang hiện tại (vd. /forgot-password) thì về landing đúng section đó. */
export function useSectionNav() {
  const navigate = useNavigate()
  return (id: string) => {
    if (!goToSection(id)) navigate({ pathname: PATHS.landing, hash: id })
  }
}

/** Landing tải lazy nên section xuất hiện sau khi điều hướng: chờ nó rồi mới cuộn. */
export function useScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const id = hash.slice(1)
    if (!id || goToSection(id)) return
    const observer = new MutationObserver(() => {
      if (goToSection(id)) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = setTimeout(() => observer.disconnect(), 5000)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [pathname, hash])
}

export function useAnchorNav() {
  const goTo = useSectionNav()
  return (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    goTo(e.currentTarget.dataset.target!)
  }
}
