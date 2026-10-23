export interface DocumentResponseDto {
  id: number
  url: string
  originalName: string | null
  contentType: string
  sizeBytes: number
  createdAt: string
}
