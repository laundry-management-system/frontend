import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateMachineRequestDto } from '../data/dto'
import { machinesApi } from '../data/machinesApi'
import { machineKeys } from './queryKeys'

export function useUpdateMachine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateMachineRequestDto }) =>
      machinesApi.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  })
}
