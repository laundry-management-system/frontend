import { useQuery } from '@tanstack/react-query'
import { DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import { servicesApi } from '../data/servicesApi'
import type { ServiceStatus } from '../domain/types'
import { serviceKeys } from './queryKeys'

/** `page` bắt đầu từ 0. */
export function useServices({
  search,
  status,
  page,
}: {
  search: string
  status?: ServiceStatus
  page: number
}) {
  const params = { search: search.trim(), status, page, size: DEFAULT_PAGE_SIZE }
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => servicesApi.list(params),
    placeholderData: (prev) => prev,
  })
}
