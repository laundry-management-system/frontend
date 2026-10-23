import { useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../data/settingsApi'
import { settingKeys } from './queryKeys'

export function useUpdateShopSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingKeys.all }),
  })
}
