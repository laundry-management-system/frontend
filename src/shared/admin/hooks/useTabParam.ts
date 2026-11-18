import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { resolveTab, stripTab, switchTabSearch } from '../lib/tabs'

/**
 * Tab đang chọn của trang tab, lưu trên URL (`?tab=`). Mỗi tab giữ bộ lọc riêng trong lượt xem trang:
 * rời tab thì cất query của nó, quay lại thì khôi phục. Đổi tab là push để nút Back về tab trước.
 */
export function useTabParam(values: readonly string[], sharedKeys: readonly string[] = []) {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab = resolveTab(raw, values)
  const saved = useRef<Record<string, string>>({})

  useEffect(() => {
    if (raw !== null && raw !== tab) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', tab)
          return next
        },
        { replace: true },
      )
    }
  }, [raw, tab, setParams])

  const setTab = (value: string) => {
    if (value === tab) return
    saved.current[tab] = stripTab(params)
    setParams(switchTabSearch(params, saved.current[value], value, sharedKeys))
  }

  return { tab, setTab }
}
