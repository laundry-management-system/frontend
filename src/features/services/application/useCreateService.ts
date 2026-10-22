import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateServiceRequestDto } from '../data/dto'
import { servicesApi } from '../data/servicesApi'
import { serviceKeys } from './queryKeys'

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateServiceRequestDto) => servicesApi.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}
