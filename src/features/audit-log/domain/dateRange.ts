const DAY_MS = 24 * 60 * 60 * 1000
const startOfVnDay = (date: string) => new Date(`${date}T00:00:00+07:00`)

/** Ngày VN (YYYY-MM-DD) → khoảng instant; BE lọc `createdAt < to` nên `to` là 00:00 ngày kế tiếp */
export function toInstantRange(from?: string, to?: string): { from?: string; to?: string } {
  return {
    from: from ? startOfVnDay(from).toISOString() : undefined,
    to: to ? new Date(startOfVnDay(to).getTime() + DAY_MS).toISOString() : undefined,
  }
}
