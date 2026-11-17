import { useMutation } from '@tanstack/react-query'
import { documentsApi } from '@/features/documents'

export function useUploadIncidentImage() {
  return useMutation({ mutationFn: (file: File) => documentsApi.upload(file) })
}
