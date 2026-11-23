import { createContext, useContext } from 'react'

/** Chỗ ListPage trong tab đưa tiêu đề lên trên và bộ lọc vào chung thẻ với thanh tab. */
export interface TabSlots {
  header: HTMLElement | null
  filters: HTMLElement | null
}
export const TabSlotsContext = createContext<TabSlots | null>(null)
export const useTabSlots = () => useContext(TabSlotsContext)
