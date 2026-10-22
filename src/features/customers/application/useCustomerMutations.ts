import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../data/customersApi'
import type { CreateCustomerRequestDto, UpdateCustomerRequestDto } from '../data/dto'
import type { CustomerStatus } from '../domain/types'
import { customerKeys } from './queryKeys'

function useInvalidateCustomers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: customerKeys.all })
}

export function useCreateCustomer() {
  const invalidate = useInvalidateCustomers()
  return useMutation({
    mutationFn: (dto: CreateCustomerRequestDto) => customersApi.create(dto),
    onSuccess: invalidate,
  })
}

export function useUpdateCustomer() {
  const invalidate = useInvalidateCustomers()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCustomerRequestDto }) =>
      customersApi.update(id, dto),
    onSuccess: invalidate,
  })
}

export function useChangeCustomerStatus() {
  const invalidate = useInvalidateCustomers()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: CustomerStatus }) =>
      customersApi.changeStatus(id, status),
    onSuccess: invalidate,
  })
}

export const findCustomerByPhone = (phone: string) =>
  customersApi.getByPhone(phone).catch(() => null)

export const countOpenOrders = (phone: string) => customersApi.countOpenOrders(phone)
