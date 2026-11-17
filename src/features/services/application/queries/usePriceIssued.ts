import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../../data/servicesApi'
import { serviceKeys } from '../queryKeys'

export function usePriceIssued() {
  return useQuery({ queryKey: serviceKeys.priceIssued(), queryFn: servicesApi.priceIssued })
}
