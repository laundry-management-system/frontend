/** Định dạng lỗi BE trả về (GlobalExceptionHandler → ProblemDetail). */
export interface ProblemDetail {
  type?: string
  title?: string
  status: number
  detail?: string
  instance?: string
  errors?: Record<string, string>
}

/** Khớp với Spring Data Page khi serialize qua PagedModel. */
export interface PageResult<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}
