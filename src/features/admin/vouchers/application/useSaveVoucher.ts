import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateVoucherRequestDto } from '../data/dto'
import { vouchersApi } from '../data/vouchersApi'
import { voucherKeys } from './queryKeys'

export function useSaveVoucher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id?: number; dto: CreateVoucherRequestDto }) => {
      if (!id) return vouchersApi.create(dto)
      const { discountType, discountValue, startDate, endDate, minOrderValue, maxUses } = dto
      return vouchersApi.update(id, {
        discountType,
        discountValue,
        startDate,
        endDate,
        minOrderValue,
        maxUses,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voucherKeys.all }),
  })
}
