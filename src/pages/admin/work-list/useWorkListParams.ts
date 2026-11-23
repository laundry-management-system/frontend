import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import { dueRange, WORK_TABS } from '@/features/admin/orders'
import { useListParams } from '@/shared/admin/hooks/useListParams'

/**
 * Bộ lọc của Danh sách công việc, lưu trên URL: tab (`status`), từ khóa (`q`), trang, ngày hẹn (`due`), hình thức giặt (`mode`).
 * Page và khối bộ lọc cùng gọi hook này; URL là nguồn sự thật nên không cần truyền props.
 */
export function useWorkListParams() {
  const list = useListParams(WORK_TABS)
  const [params, setParams] = useSearchParams()
  const due = params.get('due') ?? ''
  const mode = Number(params.get('mode'))
  const range = dueRange(due, dayjs().format('YYYY-MM-DD'))

  const update = (change: (next: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        change(next)
        next.delete('page')
        return next
      },
      { replace: true },
    )

  return {
    ...list,
    tab: list.status,
    due,
    modeId: mode > 0 ? mode : undefined,
    range,
    filtered: list.filtered || !!due || mode > 0,
    setDue: (value: string) => update((n) => (value ? n.set('due', value) : n.delete('due'))),
    setMode: (value: string | null) =>
      update((n) => (value ? n.set('mode', value) : n.delete('mode'))),
    /** Đẩy từ khóa lên URL ngay, không chờ debounce (quét mã rồi Enter) */
    commitSearch: (value: string) => update((n) => n.set('q', value)),
    clearAll: () => {
      list.setQ('')
      update((n) => ['q', 'status', 'due', 'mode'].forEach((k) => n.delete(k)))
    },
  }
}
