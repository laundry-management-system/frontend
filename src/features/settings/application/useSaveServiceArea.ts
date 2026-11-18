import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ServiceAreaRequestDto } from '../data/dto'
import { serviceAreasApi } from '../data/serviceAreasApi'
import { settingKeys } from './queryKeys'

/** Có id thì sửa, không thì thêm mới */
export function useSaveServiceArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id?: number; dto: ServiceAreaRequestDto }) =>
      id ? serviceAreasApi.update(id, dto) : serviceAreasApi.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingKeys.areas }),
  })
}
