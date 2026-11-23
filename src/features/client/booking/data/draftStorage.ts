import { migrateDraft } from '../domain/draft'
import type { StoredDraft } from '../domain/types'

const KEY = 'booking-draft:v1'

const isStored = (v: unknown): v is StoredDraft => {
  const s = v as StoredDraft | null
  return (
    !!s &&
    typeof s === 'object' &&
    !!s.values &&
    typeof s.values === 'object' &&
    Array.isArray(s.values.items) &&
    Number.isInteger(s.step) &&
    s.step >= 1 &&
    s.step <= 5 &&
    (s.owner === null || typeof s.owner === 'string') &&
    typeof s.prefilled === 'boolean'
  )
}

export const draftStorage = {
  load: (): StoredDraft | null => {
    try {
      const parsed: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
      return isStored(parsed) ? { ...parsed, values: migrateDraft(parsed.values) } : null
    } catch {
      return null
    }
  },
  save: (stored: StoredDraft) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(stored))
    } catch {
      // storage đầy/bị chặn: bỏ qua, nháp chỉ là tiện ích
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      // như save
    }
  },
}
