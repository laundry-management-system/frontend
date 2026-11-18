import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { IntakeRequestDto } from '../../data/dto'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

/** Tạo lượt nhận. BE tạo khách mới (nếu cần) và chống tạo trùng theo `requestId`. */
export function useCreateIntake() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: IntakeRequestDto) => ordersApi.createIntake(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
