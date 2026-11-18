import { httpClient } from '@/shared/common/api/httpClient'
import type {
  ChangeMachineStatusRequestDto,
  CreateMachineRequestDto,
  MachineResponseDto,
  UpdateMachineRequestDto,
} from './dto'
import { toMachine } from './mapper'

export const machinesApi = {
  list: async () => (await httpClient.get<MachineResponseDto[]>('/machines')).data.map(toMachine),

  createBatch: async (
    dto: CreateMachineRequestDto,
    quantity: number,
    serialNumbers: (string | null)[],
  ) =>
    (
      await httpClient.post<MachineResponseDto[]>('/machines/batch', {
        machine: dto,
        quantity,
        serialNumbers,
      })
    ).data.map(toMachine),

  create: async (dto: CreateMachineRequestDto) =>
    toMachine((await httpClient.post<MachineResponseDto>('/machines', dto)).data),

  update: async (id: number, dto: UpdateMachineRequestDto) =>
    toMachine((await httpClient.put<MachineResponseDto>(`/machines/${id}`, dto)).data),

  changeStatus: async (id: number, dto: ChangeMachineStatusRequestDto) =>
    toMachine((await httpClient.patch<MachineResponseDto>(`/machines/${id}/status`, dto)).data),
}
