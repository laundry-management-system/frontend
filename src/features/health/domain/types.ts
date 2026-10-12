export type HealthStatus = 'UP' | 'DOWN'

export interface Health {
  api: HealthStatus
  database: HealthStatus
  checkedAt: Date
}
