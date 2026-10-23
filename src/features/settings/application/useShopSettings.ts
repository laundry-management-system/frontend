import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../data/settingsApi'
import { settingKeys } from './queryKeys'

export function useShopSettings() {
  return useQuery({ queryKey: settingKeys.all, queryFn: settingsApi.get, staleTime: 5 * 60_000 })
}
