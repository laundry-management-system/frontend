// Khớp DocumentService của BE
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const IMAGE_MAX_BYTES = 5 * 1024 * 1024

export function imageFileError(file: { type: string; size: number }): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Chỉ nhận ảnh PNG, JPG hoặc WEBP'
  if (file.size > IMAGE_MAX_BYTES) return 'Ảnh tối đa 5 MB'
  return null
}
