import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useOverdueOrders() {
  return useQuery({ queryKey: orderKeys.overdue(), queryFn: ordersApi.overdue })
}
