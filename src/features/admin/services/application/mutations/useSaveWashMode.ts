import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { WashModeRequestDto } from '../../data/dto'
import { washModesApi } from '../../data/washModesApi'
import { serviceKeys } from '../queryKeys'

/** `id` có giá trị thì PUT, không thì POST. Giá nằm ở liên kết nên làm mới cả dịch vụ. */
export function useSaveWashMode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id?: number; dto: WashModeRequestDto }) =>
      id == null ? washModesApi.create(dto) : washModesApi.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}
