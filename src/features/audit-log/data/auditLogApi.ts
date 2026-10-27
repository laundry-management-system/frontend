import { httpClient } from '@/shared/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/api/page'
import { toInstantRange } from '../domain/dateRange'
import type { AuditLogFilter } from '../domain/types'
import type { AuditLogDetailDto, AuditLogSummaryDto } from './dto'
import { toAuditLogDetail, toAuditLogSummary } from './mapper'

export const AUDIT_LOG_PAGE_SIZE = 20

export const auditLogApi = {
  list: async (filter: AuditLogFilter) => {
    const { from, to } = toInstantRange(filter.from, filter.to)
    const { data } = await httpClient.get<SpringPage<AuditLogSummaryDto>>('/log', {
      params: {
        action: filter.action,
        entityType: filter.entityType,
        userId: filter.userId,
        from,
        to,
        page: filter.page - 1,
        size: AUDIT_LOG_PAGE_SIZE,
        direction: 'desc',
      },
    })
    return fromSpringPage(data, toAuditLogSummary)
  },
  get: async (id: number) =>
    toAuditLogDetail((await httpClient.get<AuditLogDetailDto>(`/log/${id}`)).data),
}
