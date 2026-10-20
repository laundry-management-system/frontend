import { useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '../data/servicesApi'
import type { CreateServiceRequestDto, UpdateServiceRequestDto } from '../data/dto'
import type { ServiceStatus } from '../domain/types'
import { serviceKeys } from './queryKeys'

function useInvalidateServices() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: serviceKeys.all })
}

export function useCreateService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (dto: CreateServiceRequestDto) => servicesApi.create(dto),
    onSuccess: invalidate,
  })
}

/** Lỗi ở bước đổi trạng thái sau khi PUT đã lưu – để UI báo đúng bước (BE-S5). */
export class StatusChangeError extends Error {
  readonly original: unknown
  constructor(original: unknown) {
    super('status-change-failed')
    this.original = original
  }
}

export function useUpdateService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    // BE tách đổi trạng thái ra PATCH riêng: PUT trước, đổi trạng thái sau nếu cần
    mutationFn: async (v: {
      id: number
      dto: UpdateServiceRequestDto
      status: ServiceStatus
      previousStatus: ServiceStatus
    }) => {
      const saved = await servicesApi.update(v.id, v.dto)
      if (v.status === v.previousStatus) return saved
      try {
        return await servicesApi.changeStatus(v.id, v.status)
      } catch (error) {
        throw new StatusChangeError(error)
      }
    },
    // Lỗi bước 2 thì thông tin đã lưu: vẫn làm mới bảng
    onSettled: invalidate,
  })
}
