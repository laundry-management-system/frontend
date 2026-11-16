import { Text } from '@mantine/core'
import { memo, useState } from 'react'
import { LuReceiptText } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { DataTable, type DataTableColumn, EmptyState, OrderCode } from '@/shared/ui'
import { useShiftTransactions } from '../application/queries/useShiftTransactions'
import { SHIFT_TRANSACTION_LABEL, type ShiftTransaction } from '../domain/types'

const PAGE_SIZE = 10
const METHOD_LABEL = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản' } as const
const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

const columns: DataTableColumn<ShiftTransaction>[] = [
  { name: 'at', label: 'Giờ', width: 70, render: (t) => formatDateTime(t.at).slice(11, 16) },
  { name: 'order', label: 'Mã đơn', render: (t) => <OrderCode code={t.orderCode} /> },
  { name: 'type', label: 'Loại', render: (t) => SHIFT_TRANSACTION_LABEL[t.type] },
  { name: 'method', label: 'Phương thức', render: (t) => METHOD_LABEL[t.method] },
  {
    name: 'amount',
    label: 'Số tiền',
    // Hủy / hoàn là tiền đi ra khỏi két hoặc trừ khỏi tổng chuyển khoản
    render: (t) => (
      <Text
        size="sm"
        fw={500}
        style={TABULAR}
        c={t.type === 'COLLECT' ? undefined : 'var(--tone-danger-fg)'}
      >
        {t.type === 'COLLECT' ? formatMoney(t.amount) : `−${formatMoney(t.amount)}`}
      </Text>
    ),
  },
  { name: 'actor', label: 'NV thao tác', render: (t) => t.actorName },
]

const rowKey = (t: ShiftTransaction) => `${t.type}-${t.orderId}-${t.at}`

/**
 * Thu / hủy xác nhận / hoàn tiền trong ca, mới nhất trước; bấm dòng mở đơn.
 * memo: chỉ phụ thuộc shiftId, không cần render lại theo từng phím gõ của form kết ca.
 */
export const ShiftTransactionsTable = memo(function ShiftTransactionsTable({
  shiftId,
}: {
  shiftId: number
}) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useShiftTransactions(shiftId, { page: page - 1, size: PAGE_SIZE })

  const rowProps = (t: ShiftTransaction) => ({
    onClick: () => navigate(`/orders/${t.orderId}`),
    style: { cursor: 'pointer' },
  })
  const empty = (
    <EmptyState
      icon={<LuReceiptText size={32} />}
      title="Chưa có giao dịch trong ca"
      description="Các lần thu tiền, hủy xác nhận và hoàn tiền trong ca sẽ hiện ở đây."
    />
  )

  return (
    <DataTable
      columns={columns}
      data={data?.content ?? []}
      rowKey={rowKey}
      rowProps={rowProps}
      loading={isLoading}
      empty={empty}
      page={page}
      totalPages={data?.page.totalPages ?? 0}
      onPageChange={setPage}
    />
  )
})
