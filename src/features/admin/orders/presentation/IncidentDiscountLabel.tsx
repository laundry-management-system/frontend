import { Group, Stack } from '@mantine/core'
import { EntityCode } from '@/shared/admin/ui'

/** Nhãn "Giảm giá sự cố": mã sự cố nằm dòng dưới, nhỏ và mờ, xuống dòng khi nhiều mã. */
export function IncidentDiscountLabel({ codes }: { codes: string[] }) {
  return (
    <Stack gap={2}>
      Giảm giá sự cố
      {codes.length > 0 && (
        <Group gap={6} c="dimmed">
          {codes.map((c) => (
            <EntityCode key={c} code={c} size="sm" />
          ))}
        </Group>
      )}
    </Stack>
  )
}
