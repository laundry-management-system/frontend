import { useQuery } from '@tanstack/react-query'
import { machinesApi } from '../data/machinesApi'
import { machineKeys } from './queryKeys'

export function useMachines() {
  return useQuery({ queryKey: machineKeys.list(), queryFn: machinesApi.list })
}
