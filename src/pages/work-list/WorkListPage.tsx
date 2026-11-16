import { Button } from '@mantine/core'
import dayjs from 'dayjs'
import { LuListTodo, LuPrinter, LuSearchX } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import {
  type OrderListItem,
  rowFlag,
  useNow,
  useWorkCounts,
  useWorkOrders,
  WorkListPrintSheet,
  WORK_TAB_LABEL,
} from '@/features/orders'
import { NoShiftBanner } from '@/features/shifts'
import { useMe } from '@/features/users'
import { DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import { EmptyState, ListPage } from '@/shared/ui'
import { WorkListFilters } from './components/WorkListFilters'
import { workColumns } from './components/workColumns'
import { useWorkListParams } from './useWorkListParams'

const FLAG_CLASS = { late: 'ds-row-flag-late', express: 'ds-row-flag-express' } as const

const weekday = (d: dayjs.Dayjs) => (d.day() === 0 ? 'Chủ nhật' : `Thứ ${d.day() + 1}`)

export default function WorkListPage() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const now = useNow()
  const { search, tab, page, setPage, range, filtered, clearAll } = useWorkListParams()
  const { data, isLoading, isError, refetch } = useWorkOrders({
    tab,
    q: search,
    ...range,
    page: page - 1,
    size: DEFAULT_PAGE_SIZE,
  })
  const { data: counts } = useWorkCounts({ q: search, ...range })
  const rows = data?.content ?? []

  const handleRetry = () => refetch()
  const printList = () => window.print()
  const rowKey = (o: OrderListItem) => o.id
  const rowProps = (o: OrderListItem) => {
    const flag = rowFlag(o, now)
    return {
      onClick: () => navigate(`/orders/${o.id}`),
      style: { cursor: 'pointer' },
      className: flag ? FLAG_CLASS[flag] : undefined,
    }
  }

  const columns = workColumns(now)
  const filters = <WorkListFilters />
  const notice = <NoShiftBanner staffName={me?.fullName ?? ''} withAction={false} />

  const empty = filtered ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không có đơn phù hợp"
      description={
        search.trim()
          ? `Không có đơn chưa hoàn thành nào khớp "${search.trim()}".`
          : 'Không có đơn chưa hoàn thành nào khớp bộ lọc.'
      }
      action={
        <Button variant="secondary" onClick={clearAll}>
          Xóa lọc
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<LuListTodo size={32} />}
      title="Không còn đơn nào cần làm"
      description="Đơn Mới nhận và Đang xử lý sẽ hiện ở đây."
    />
  )

  const d = dayjs(now)
  const description = `${weekday(d)}, ${d.format('DD/MM/YYYY')} · xem lúc ${d.format('HH:mm')} · ${
    counts?.ALL ?? 0
  } đơn chưa hoàn thành`

  const headerActions = (
    <Button variant="secondary" leftSection={<LuPrinter size={16} />} onClick={printList}>
      In danh sách
    </Button>
  )

  return (
    <>
      <ListPage<OrderListItem>
        title="Danh sách công việc"
        description={description}
        info="Đơn chưa Hoàn thành, hẹn trả sớm nhất ở trên. Đơn chưa phân loại phải phân loại xong mới bắt đầu xử lý được."
        actions={headerActions}
        notice={notice}
        filters={filters}
        columns={columns}
        data={rows}
        rowKey={rowKey}
        loading={isLoading}
        error={isError}
        onRetry={handleRetry}
        rowProps={rowProps}
        page={page}
        totalPages={data?.page.totalPages ?? 0}
        onPageChange={setPage}
        empty={empty}
      />
      <WorkListPrintSheet
        title={`Danh sách công việc · ${WORK_TAB_LABEL[tab]}`}
        rows={rows}
        now={now}
      />
    </>
  )
}
