import type { PageResult } from '@/shared/types/api'

export interface SpringPage<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export function fromSpringPage<D, T>(raw: SpringPage<D>, map: (d: D) => T): PageResult<T> {
  return {
    content: raw.content.map(map),
    page: {
      size: raw.size,
      number: raw.number,
      totalElements: raw.totalElements,
      totalPages: raw.totalPages,
    },
  }
}
