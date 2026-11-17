import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateMachineRequestDto } from '../data/dto'
import { machinesApi } from '../data/machinesApi'
import type { Machine } from '../domain/types'
import { machineKeys } from './queryKeys'

export function useCreateMachine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      dto,
      quantity,
      serialNumbers,
    }: {
      dto: CreateMachineRequestDto
      quantity: number
      serialNumbers: (string | null)[]
    }): Promise<Machine[]> =>
      quantity > 1
        ? machinesApi.createBatch(dto, quantity, serialNumbers)
        : [await machinesApi.create(dto)],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  })
}
