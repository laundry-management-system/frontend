import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toApiError } from '@/shared/common/api/apiError'
import { shiftsApi } from '../../data/shiftsApi'
import type { CloseShiftInput } from '../../domain/types'
import { invalidateShifts } from '../invalidateShifts'
import { shiftKeys } from '../queryKeys'

export function useCloseShift(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CloseShiftInput) => shiftsApi.close(id, input),
    // Nhân viên chỉ đọc được ca đang mở: không tải lại chi tiết / giao dịch của ca vừa kết (sẽ 403)
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: shiftKeys.all,
        predicate: ({ queryKey }) =>
          !(queryKey[1] === 'detail' || queryKey[1] === 'transactions') || queryKey[2] !== id,
      }),
    // 409: có giao dịch mới hoặc ca đã kết ở máy khác → tải lại số, form giữ nguyên số đã nhập
    onError: (err) => {
      if (toApiError(err).status === 409) invalidateShifts(queryClient)
    },
  })
}
