import { useSearchParams } from 'react-router-dom'

const PENDING_PARAM = 'pendingAccount'

/** Bộ lọc "Chờ duyệt tài khoản" nằm trên URL để trang và ô lọc cùng đọc một nguồn. */
export function usePendingAccountParam() {
  const [params, setParams] = useSearchParams()
  const pendingOnly = params.get(PENDING_PARAM) === '1'
  const togglePending = () => {
    const checked = !pendingOnly
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (checked) next.set(PENDING_PARAM, '1')
        else next.delete(PENDING_PARAM)
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }
  return { pendingOnly, togglePending }
}
