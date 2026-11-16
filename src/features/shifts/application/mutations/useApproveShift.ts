import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import { invalidateShifts } from '../invalidateShifts'

export function useApproveShift(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (note: string) => shiftsApi.approve(id, { note: note.trim() || undefined }),
    onSettled: () => invalidateShifts(queryClient),
  })
}
