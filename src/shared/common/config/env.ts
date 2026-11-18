import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api'),
})

// Sai cấu hình thì fail ngay lúc khởi động thay vì lỗi mơ hồ khi gọi API
export const env = envSchema.parse(import.meta.env)
