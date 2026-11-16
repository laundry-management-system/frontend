import { useQuery } from '@tanstack/react-query'
import { auditLogApi } from '../data/auditLogApi'
import { auditLogKeys } from './queryKeys'

export function useAuditLog(id: number | null) {
  return useQuery({
    queryKey: auditLogKeys.detail(id ?? 0),
    queryFn: () => auditLogApi.get(id!),
    enabled: id != null,
  })
}
