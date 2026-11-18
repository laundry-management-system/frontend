import { useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceAreasApi } from '../data/serviceAreasApi'
import { settingKeys } from './queryKeys'

export function useChangeServiceAreaStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      serviceAreasApi.changeStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingKeys.areas }),
  })
}
