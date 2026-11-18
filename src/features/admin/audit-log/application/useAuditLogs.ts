import { useQuery } from '@tanstack/react-query'
import { auditLogApi } from '../data/auditLogApi'
import type { AuditLogFilter } from '../domain/types'
import { auditLogKeys } from './queryKeys'

export function useAuditLogs(filter: AuditLogFilter) {
  return useQuery({
    queryKey: auditLogKeys.list(filter),
    queryFn: () => auditLogApi.list(filter),
    placeholderData: (prev) => prev,
  })
}
