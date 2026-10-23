import { httpClient } from '@/shared/api/httpClient'
import type { DocumentResponseDto } from './dto'

export interface UploadedDocument {
  id: number
  /** Đường dẫn công khai để hiển thị (`/api/documents/files/...`) */
  url: string
}

export const documentsApi = {
  upload: async (file: File): Promise<UploadedDocument> => {
    const body = new FormData()
    body.append('file', file)
    const { data } = await httpClient.post<DocumentResponseDto>('/documents', body)
    return { id: data.id, url: data.url }
  },
}
