import { notifications } from '@mantine/notifications'

// Toast DS: góc phải dưới, tự ẩn 4s (cấu hình ở <Notifications />); lỗi không tự ẩn
export const notify = {
  success: (message: string, title?: string) =>
    notifications.show({ message, title, color: 'success' }),
  info: (message: string, title?: string) => notifications.show({ message, title, color: 'info' }),
  error: (message: string, title?: string) =>
    notifications.show({ message, title, color: 'danger', autoClose: false }),
}
