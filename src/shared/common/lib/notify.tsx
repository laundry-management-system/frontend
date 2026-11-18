import { notifications } from '@mantine/notifications'
import type { ReactNode } from 'react'
import { LuCircleCheck, LuCircleX, LuInfo, LuTriangleAlert } from 'react-icons/lu'

type Tone = 'success' | 'info' | 'warning' | 'danger'

// Toast DS: top-center, tự ẩn 4s (cấu hình ở <Notifications />); lỗi không tự ẩn
function show(tone: Tone, icon: ReactNode, defaultTitle: string, message: string, title?: string) {
  notifications.show({
    color: tone,
    icon,
    title: title ?? defaultTitle,
    message,
    ...(tone === 'danger' && { autoClose: false }),
  })
}

export const notify = {
  success: (message: string, title?: string) =>
    show('success', <LuCircleCheck size={20} />, 'Thành công', message, title),
  info: (message: string, title?: string) =>
    show('info', <LuInfo size={20} />, 'Thông báo', message, title),
  warning: (message: string, title?: string) =>
    show('warning', <LuTriangleAlert size={20} />, 'Cảnh báo', message, title),
  error: (message: string, title?: string) =>
    show('danger', <LuCircleX size={20} />, 'Có lỗi xảy ra', message, title),
}
