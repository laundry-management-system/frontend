import { useQuery } from '@tanstack/react-query'
import { serviceAreasApi } from '../data/serviceAreasApi'
import { settingKeys } from './queryKeys'

export function useServiceAreas() {
  return useQuery({ queryKey: settingKeys.areas, queryFn: serviceAreasApi.list })
}
