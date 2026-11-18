import { Stack, Text } from '@mantine/core'

/** Lý do đã ghi (chế độ chỉ đọc), cùng vị trí với ô nhập lý do khi kết ca */
export function ReasonText({ label, text }: { label: string; text: string }) {
  return (
    <Stack gap={2}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Text size="sm" p="sm" bg="var(--ds-muted)" style={{ borderRadius: 'var(--radius-control)' }}>
        {text}
      </Text>
    </Stack>
  )
}
