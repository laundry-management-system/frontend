/** Đúng như BE trả về: HealthResponse(status, database, time). */
export interface HealthResponseDto {
  status: 'UP' | 'DOWN'
  database: 'UP' | 'DOWN'
  time: string
}
