import type { AuditLogFilter } from '../domain/types'

export const auditLogKeys = {
  all: ['audit-log'] as const,
  list: (filter: AuditLogFilter) => [...auditLogKeys.all, 'list', filter] as const,
  detail: (id: number) => [...auditLogKeys.all, 'detail', id] as const,
}
