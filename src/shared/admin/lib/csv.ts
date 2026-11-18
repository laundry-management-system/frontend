type Cell = string | number | null

const escapeCell = (cell: Cell) => {
  if (cell === null) return ''
  const s = String(cell)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV có BOM để Excel mở đúng tiếng Việt; số giữ dạng thô để Excel tính được. */
export const toCsv = (rows: Cell[][]) =>
  '﻿' + rows.map((r) => r.map(escapeCell).join(',')).join('\r\n')

export function downloadCsv(filename: string, rows: Cell[][]) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
