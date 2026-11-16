export interface AuditLogSummaryDto {
  id: number
  action: string
  entityType: string
  entityId: number | null
  userId: number
  fullName: string | null
  username: string | null
  ipAddress: string | null
  createdAt: string
}

export interface AuditLogDetailDto extends AuditLogSummaryDto {
  oldData: Record<string, unknown> | null
  newData: Record<string, unknown> | null
  reason: string | null
}
