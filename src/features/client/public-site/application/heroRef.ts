import { createContext, useContext } from 'react'

// Khung trang (thanh gọi dính đáy) cần biết khi nào phần mở đầu ra khỏi màn hình; Hero gắn ref này vào section của nó
export const HeroRefContext = createContext<((el: HTMLElement | null) => void) | undefined>(
  undefined,
)

export const useHeroRef = () => useContext(HeroRefContext)
