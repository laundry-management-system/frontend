import { isAxiosError } from 'axios'
import type { ProblemDetail } from '@/shared/types/api'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? 'Có lỗi xảy ra')
    this.name = 'ApiError'
    this.status = problem.status
    this.fieldErrors = problem.errors ?? {}
  }
}

/** Chuẩn hoá mọi lỗi axios về ApiError để UI chỉ xử lý một kiểu. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (isAxiosError<ProblemDetail>(error)) {
    if (error.response?.data?.status) return new ApiError(error.response.data)
    return new ApiError({
      status: error.response?.status ?? 0,
      detail: error.response ? error.message : 'Không kết nối được máy chủ',
    })
  }
  return new ApiError({ status: 0, detail: error instanceof Error ? error.message : String(error) })
}
