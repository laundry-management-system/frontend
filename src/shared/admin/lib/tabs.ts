/** Tab trên URL (`?tab=`) sai hoặc không có quyền → tab đầu tiên được phép. */
export const resolveTab = (raw: string | null, values: readonly string[]) =>
  raw !== null && values.includes(raw) ? raw : values[0]

/**
 * Query khi chuyển sang `tab`: khôi phục bộ lọc đã lưu của tab đó (các tab trùng khóa `q`, `page`…
 * nên không dùng chung được), chỉ mang theo `sharedKeys` (VD kỳ báo cáo) từ tab đang mở.
 */
export function switchTabSearch(
  current: URLSearchParams,
  saved: string | undefined,
  tab: string,
  sharedKeys: readonly string[],
) {
  const next = new URLSearchParams(saved ?? '')
  for (const key of sharedKeys) {
    const value = current.get(key)
    if (value === null) next.delete(key)
    else next.set(key, value)
  }
  next.set('tab', tab)
  return next
}

export function stripTab(search: URLSearchParams) {
  const next = new URLSearchParams(search)
  next.delete('tab')
  return next.toString()
}
