import { useMutation } from '@tanstack/react-query'
import { documentsApi } from '@/features/admin/documents'

export function useUploadMachineImage() {
  return useMutation({ mutationFn: (file: File) => documentsApi.upload(file) })
}
