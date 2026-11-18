import type { FieldDiff } from './types'

const SENSITIVE = /password|hash|token|secret/i
const MASK = '••••••'

const format = (v: unknown) =>
  v == null ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v)

export function diffFields(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
): FieldDiff[] {
  const keys = [...new Set([...Object.keys(oldData ?? {}), ...Object.keys(newData ?? {})])]
  return keys.map((key) => {
    const old = format(oldData?.[key])
    const next = format(newData?.[key])
    const masked = SENSITIVE.test(key)
    return {
      key,
      old: masked ? MASK : old,
      new: masked ? MASK : next,
      changed: old !== next,
      masked,
    }
  })
}
