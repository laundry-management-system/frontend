import { LuListTodo } from 'react-icons/lu'
import { EmptyState, PageHeader } from '@/shared/ui'

// Trang tạm – trang chủ của Nhân viên cho tới khi làm feature Danh sách công việc (WF-B02)
export default function WorkListPage() {
  return (
    <>
      <PageHeader title="Danh sách công việc" />
      <EmptyState
        icon={<LuListTodo size={32} />}
        title="Đang xây dựng"
        description="Danh sách đơn chưa hoàn thành sẽ hiển thị ở đây."
      />
    </>
  )
}
