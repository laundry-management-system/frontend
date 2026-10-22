import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from './useDebounce'

/**
 * Từ khóa, trạng thái và trang của màn danh sách, lưu trên URL (`?q=&status=&page=`) để F5 / chia sẻ link không mất.
 * URL là nguồn sự thật; ô gõ (`q`) đẩy lên URL sau debounce và tự cập nhật khi URL đổi từ ngoài
 * (bấm lại menu, Back/Forward). `page` bắt đầu từ 1; đổi từ khóa hoặc trạng thái thì về trang 1.
 */
export function useListParams<S extends string>(statuses: readonly S[]) {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const rawStatus = params.get('status')
  const status: S | 'ALL' = statuses.includes(rawStatus as S) ? (rawStatus as S) : 'ALL'
  const page = Math.max(Number(params.get('page')) || 1, 1)

  const [q, setQ] = useState(search)
  // URL đổi từ ngoài → đồng bộ ô gõ (chỉnh state ngay trong render, không dùng effect)
  const [syncedSearch, setSyncedSearch] = useState(search)
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    setQ(search)
  }

  // Bỏ giá trị mặc định khỏi URL cho gọn
  const write = (query: string, st: S | 'ALL', p: number) =>
    setParams(
      {
        ...(query && { q: query }),
        ...(st !== 'ALL' && { status: st }),
        ...(p > 1 && { page: String(p) }),
      },
      { replace: true },
    )

  const typed = useDebounce(q, 300)
  useEffect(() => {
    if (typed !== search) write(typed, status, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi từ khóa gõ (đã debounce) đổi
  }, [typed])

  return {
    /** Giá trị ô tìm kiếm (chưa debounce) */
    q,
    setQ,
    /** Từ khóa đang áp dụng (trên URL), dùng để gọi API */
    search,
    status,
    setStatus: (st: S | 'ALL') => write(search, st, 1),
    page,
    setPage: (p: number) => write(search, status, p),
    /** Có đang tìm / lọc không (để chọn empty state) */
    filtered: !!search.trim() || status !== 'ALL',
    reset: () => {
      setQ('')
      write('', 'ALL', 1)
    },
  }
}
