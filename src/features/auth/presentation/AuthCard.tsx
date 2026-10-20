import { Box, Paper, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { MdLocalLaundryService } from 'react-icons/md'

/** Khung chung cho các màn chưa đăng nhập (đăng nhập, đặt mật khẩu): logo + tên tiệm + phụ đề. */
export function AuthCard({ subtitle, children }: { subtitle: string; children: ReactNode }) {
  return (
    <Paper withBorder radius="lg" shadow="lg" p={40} w="100%" maw={440}>
      <Stack gap={20}>
        <Stack gap={8} align="center">
          <Box
            w={56}
            h={56}
            bg="var(--mantine-primary-color-filled)"
            c="var(--ds-primary-foreground)"
            className="flex items-center justify-center rounded-lg"
          >
            <MdLocalLaundryService size={30} />
          </Box>
          <Text fz={22} fw={700}>
            Tiệm Giặt Ủi
          </Text>
          <Text c="dimmed">{subtitle}</Text>
        </Stack>
        {children}
      </Stack>
    </Paper>
  )
}
