import { useSearchParams } from 'react-router-dom'
import { AUDIT_ACTIONS, ENTITY_TYPES } from '../domain/labels'
import type { AuditAction, AuditLogFilter, EntityType } from '../domain/types'

const DATE = /^\d{4}-\d{2}-\d{2}$/
const FILTER_KEYS = ['from', 'to', 'userId', 'action', 'entityType'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

const oneOf = <T extends string>(list: readonly T[], v: string | null) =>
  list.includes(v as T) ? (v as T) : undefined

/**
 * Bộ lọc nhật ký trên URL (`?from=&to=&userId=&action=&entityType=&page=&log=`).
 * Không dùng useListParams vì màn này có 5 bộ lọc thay vì q/status; đổi bộ lọc thì về trang 1.
 */
export function useAuditLogParams() {
  const [params, setParams] = useSearchParams()

  const rawUser = params.get('userId')
  const userId = rawUser != null && /^\d+$/.test(rawUser) ? Number(rawUser) : undefined
  const rawPage = Number(params.get('page'))
  const rawLog = Number(params.get('log'))

  const filter: AuditLogFilter = {
    from: DATE.test(params.get('from') ?? '') ? params.get('from')! : undefined,
    to: DATE.test(params.get('to') ?? '') ? params.get('to')! : undefined,
    userId,
    action: oneOf<AuditAction>(AUDIT_ACTIONS, params.get('action')),
    entityType: oneOf<EntityType>(ENTITY_TYPES, params.get('entityType')),
    page: Number.isInteger(rawPage) && rawPage > 1 ? rawPage : 1,
  }

  const update = (
    patch: Partial<Record<FilterKey | 'page' | 'log', string | undefined>>,
    push = false,
  ) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(patch)) {
          if (v) next.set(k, v)
          else next.delete(k)
        }
        return next
      },
      { replace: !push },
    )
  const setFilter = (patch: Partial<Record<FilterKey, string | undefined>>) =>
    update({ ...patch, page: undefined })

  return {
    filter,
    filtered: FILTER_KEYS.some((k) => filter[k] != null),
    setRange: (from?: string, to?: string) => setFilter({ from, to }),
    setUserId: (id?: string) => setFilter({ userId: id }),
    setAction: (action?: string) => setFilter({ action }),
    setEntityType: (entityType?: string) => setFilter({ entityType }),
    setPage: (p: number) => update({ page: p > 1 ? String(p) : undefined }),
    reset: () => setParams({}, { replace: true }),
    openLogId: Number.isInteger(rawLog) && rawLog > 0 ? rawLog : null,
    // push để nút Back của trình duyệt đóng được Drawer
    openLog: (id: number) => update({ log: String(id) }, true),
    closeLog: () => update({ log: undefined }),
  }
}

export type AuditLogParams = ReturnType<typeof useAuditLogParams>
