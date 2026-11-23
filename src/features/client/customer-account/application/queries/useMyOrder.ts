import { useQuery } from '@tanstack/react-query'
import { customerPortalApi } from '../../data/customerPortalApi'
import { customerKeys } from '../queryKeys'
import { customerOrderDetailSchema } from '../schemas'
import { useCustomerSessionStore } from '../sessionStore'

/** Refetch khi focus lại tab (nhân viên xác nhận thanh toán); không polling. 404 không retry. */
export function useMyOrder(orderCode: string) {
  const status = useCustomerSessionStore((s) => s.status)
  return useQuery({
    queryKey: customerKeys.order(orderCode),
    queryFn: async () =>
      customerOrderDetailSchema.parse(await customerPortalApi.getMyOrder(orderCode)),
    enabled: status === 'authenticated' && !!orderCode,
    refetchOnWindowFocus: true,
    retry: false,
  })
}
