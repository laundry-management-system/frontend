import { useMutation, useQueryClient } from '@tanstack/react-query'
import { machinesApi } from '../data/machinesApi'
import type { MachineStatus } from '../domain/types'
import { machineKeys } from './queryKeys'

export function useChangeMachineStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: MachineStatus; reason: string }) =>
      machinesApi.changeStatus(id, { status, reason: reason.trim() || undefined }),
    // Cả khi lỗi: máy có thể đã bị người khác đổi trạng thái
    onSettled: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  })
}
