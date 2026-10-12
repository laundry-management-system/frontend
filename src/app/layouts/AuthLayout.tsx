import { Center, Paper } from '@mantine/core'
import { Outlet } from 'react-router-dom'

/** Khung cho các trang chưa đăng nhập (login, quên mật khẩu). */
export function AuthLayout() {
  return (
    <Center mih="100vh" bg="var(--mantine-color-body)">
      <Paper withBorder shadow="sm" p="xl" w={380}>
        <Outlet />
      </Paper>
    </Center>
  )
}
