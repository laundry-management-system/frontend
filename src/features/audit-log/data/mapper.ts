import type { AuditLogDetail, AuditLogSummary } from '../domain/types'
import type { AuditLogDetailDto, AuditLogSummaryDto } from './dto'

export const toAuditLogSummary = (dto: AuditLogSummaryDto): AuditLogSummary => ({
  id: dto.id,
  action: dto.action,
  entityType: dto.entityType,
  entityId: dto.entityId,
  userId: dto.userId,
  fullName: dto.fullName,
  username: dto.username,
  ipAddress: dto.ipAddress,
  createdAt: dto.createdAt,
})

export const toAuditLogDetail = (dto: AuditLogDetailDto): AuditLogDetail => ({
  ...toAuditLogSummary(dto),
  oldData: dto.oldData,
  newData: dto.newData,
  reason: dto.reason,
})
