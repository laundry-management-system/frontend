import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../data/settingsApi'
import { settingKeys } from './queryKeys'

export function useSettings() {
  return useQuery({ queryKey: settingKeys.all, queryFn: settingsApi.list, staleTime: 5 * 60_000 })
}
