import { Button } from '@mantine/core'
import { LuCloudOff } from 'react-icons/lu'
import { EmptyState } from '@/shared/admin/ui'

/** Trạng thái lỗi chung của trang báo cáo: một nút thử lại. */
export function ReportLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được báo cáo"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={onRetry}>Thử lại</Button>}
    />
  )
}
