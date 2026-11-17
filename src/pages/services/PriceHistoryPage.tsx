import { Button, Text } from '@mantine/core'
import { LuDownload, LuFileText, LuReceiptText, LuSearchX } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import {
  PRICE_HISTORY_COLUMNS,
  PriceHistoryFilters,
  type PriceHistoryRow,
  useExportPriceHistory,
  usePriceHistory,
  usePriceHistoryParams,
} from '@/features/services'
import { EmptyState, ListPage } from '@/shared/ui'
import { PATHS } from '@/shared/config/paths'

const rowKey = (r: PriceHistoryRow) => `${r.logId}-${r.field}`

export default function PriceHistoryPage() {
  const params = usePriceHistoryParams()
  const { filter, page, filtered, setPage, reset } = params
  const { data, isLoading, isError, refetch } = usePriceHistory(filter)
  const { exportCsv, exporting } = useExportPriceHistory()

  const rows = data?.content ?? []
  const total = data?.page.totalElements ?? 0
  const handleRetry = () => refetch()
  const handleExport = () => exportCsv(filter)

  const headerActions = (
    <>
      <Button
        variant="secondary"
        leftSection={<LuFileText size={16} />}
        component={Link}
        to={`${PATHS.auditLog}?action=PRICE_CHANGE`}
      >
        Xem trong Nhật ký hệ thống
      </Button>
      <Button
        variant="secondary"
        leftSection={<LuDownload size={16} />}
        disabled={total === 0}
        loading={exporting}
        onClick={handleExport}
      >
        Xuất Excel
      </Button>
    </>
  )

  const filters = <PriceHistoryFilters params={params} />

  const resetButton = (
    <Button variant="secondary" onClick={reset}>
      Đặt lại bộ lọc
    </Button>
  )
  const empty = filtered ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không có thay đổi nào khớp bộ lọc"
      description="Thử chọn khoảng ngày rộng hơn hoặc bỏ bớt bộ lọc."
      action={resetButton}
    />
  ) : (
    <EmptyState
      icon={<LuReceiptText size={32} />}
      title="Chưa có thay đổi giá trong năm nay"
      description="Mỗi lần Admin đổi đơn giá, phụ phí, thời gian xử lý hoặc trạng thái dịch vụ sẽ hiện ở đây."
    />
  )

  const first = filter.page * filter.size + 1
  const rangeText = total > 0 && (
    <Text size="sm" c="dimmed" mt="sm">
      {`Hiển thị ${first}–${first + rows.length - 1} / ${total} thay đổi`}
    </Text>
  )

  return (
    <ListPage<PriceHistoryRow>
      title="Lịch sử thay đổi giá"
      description={`${total.toLocaleString('vi-VN')} lần thay đổi trong kỳ`}
      info="Đổi giá không ảnh hưởng đơn đã tạo – đơn giá được chốt trên từng dòng đơn."
      actions={headerActions}
      filters={filters}
      columns={PRICE_HISTORY_COLUMNS}
      data={rows}
      rowKey={rowKey}
      loading={isLoading}
      error={isError}
      onRetry={handleRetry}
      page={page}
      totalPages={data?.page.totalPages ?? 0}
      onPageChange={setPage}
      empty={empty}
    >
      {rangeText}
    </ListPage>
  )
}
