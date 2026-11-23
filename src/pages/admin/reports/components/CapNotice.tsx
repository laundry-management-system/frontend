import { Text } from '@mantine/core'
import { MAX_TABLE_ROWS } from '@/features/admin/reports'
import { formatNumber } from '@/shared/common/lib/format'

/** Báo khi bảng bị cắt ở giới hạn hiển thị (CSV vẫn đủ dòng). */
export function CapNotice({ truncated }: { truncated: boolean }) {
  if (!truncated) return null
  return (
    <Text size="sm" c="dimmed" mt="xs">
      Chỉ hiển thị {formatNumber(MAX_TABLE_ROWS)} dòng đầu, hãy thu hẹp kỳ hoặc xuất CSV
    </Text>
  )
}
