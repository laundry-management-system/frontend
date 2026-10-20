import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../data/servicesApi'
import { serviceKeys } from './queryKeys'

export function useServices() {
  return useQuery({ queryKey: serviceKeys.list(), queryFn: servicesApi.list })
}
