import { draftStorage, type OrderDraft } from '../data/draftStorage'

export type { OrderDraft }

/** Nháp phân loại theo đơn (chỉ trên máy này). */
export function useOrderDraft() {
  return draftStorage
}
