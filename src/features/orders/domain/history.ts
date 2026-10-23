import { ORDER_STATUS_LABEL, type HistoryActionType, type OrderStatus } from './types.ts'

const STATUS_ACTIONS: HistoryActionType[] = [
  'STATUS_CHANGE',
  'REVERT_STATUS',
  'CANCELLED',
  'CREATED',
]

const pad = (n: number) => String(n).padStart(2, '0')

const formatInstant = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function describeHistoryValue(actionType: HistoryActionType, value: string | null) {
  if (value == null || value === '') return null
  if (STATUS_ACTIONS.includes(actionType)) return ORDER_STATUS_LABEL[value as OrderStatus] ?? value
  if (actionType === 'RESCHEDULE') return formatInstant(value)
  if (actionType === 'PRICE_ADJUST') {
    const n = Number(value)
    return Number.isFinite(n) ? `${n.toLocaleString('vi-VN')}đ` : value
  }
  return value
}

export const sortHistory = <T extends { createdAt: string }>(entries: T[]) =>
  [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
