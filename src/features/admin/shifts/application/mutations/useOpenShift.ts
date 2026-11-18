import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import type { OpenShiftInput } from '../../domain/types'
import { invalidateShifts } from '../invalidateShifts'

export function useOpenShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: OpenShiftInput) => shiftsApi.open(input),
    onSuccess: () => invalidateShifts(queryClient),
  })
}
