import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateServiceRequestDto } from '../data/dto'
import { servicesApi } from '../data/servicesApi'
import { serviceKeys } from './queryKeys'

/** Một PUT lưu cả thông tin, giá và trạng thái. */
export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateServiceRequestDto }) =>
      servicesApi.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}
