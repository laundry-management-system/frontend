import { Center } from '@mantine/core'
import { Outlet } from 'react-router-dom'

/** Khung cho các trang chưa đăng nhập; thẻ nội dung do từng trang tự vẽ. */
export function AuthLayout() {
  return (
    <Center mih="100vh" p={16} bg="var(--ds-surface)">
      <Outlet />
    </Center>
  )
}
