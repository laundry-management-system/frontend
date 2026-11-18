import { Button, Group, Modal, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { LuCloudOff, LuWallet } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '@/shared/common/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  DataTable,
  EmptyState,
  Money,
  StatusBadge,
} from '@/shared/admin/ui'
import { useRevenuePayments } from '../application/useRevenuePayments'
import type { DateRange, RevenuePayment } from '../domain/types'
import { PATHS } from '@/shared/common/config/paths'

const METHOD_KEY = { CASH: 'cash', BANK_TRANSFER: 'qr' } as const

interface RevenueDayModalProps {
  range: DateRange
  title: string
  /** Số giao dịch của cột; nhiều hơn số dòng tải về nghĩa là API đã cắt bớt */
  expectedCount?: number
  onClose: () => void
}

/** Các giao dịch được cộng vào doanh thu của một cột; tổng khớp với cột trên biểu đồ. */
export function RevenueDayModal({ range, title, expectedCount, onClose }: RevenueDayModalProps) {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useRevenuePayments(range)
  const payments = data ?? []
  const total = payments.reduce((sum, p) => sum + p.amount, 0)
  const oneDay = range.from === range.to
  const truncated = expectedCount !== undefined && expectedCount > payments.length

  const handleRetry = () => refetch()
  const rowKey = (p: RevenuePayment) => p.paymentId
  const rowProps = (p: RevenuePayment) => ({
    onClick: () => navigate(PATHS.orderDetail(p.orderId)),
    style: { cursor: 'pointer' },
  })

  const columns: DataTableColumn<RevenuePayment>[] = [
    {
      name: 'time',
      label: 'Giờ',
      width: oneDay ? 70 : 110,
      render: (p) => dayjs(p.paidAt).format(oneDay ? 'HH:mm' : 'DD/MM HH:mm'),
    },
    {
      name: 'order',
      label: 'Mã đơn',
      width: 170,
      render: (p) => <CopyableCode code={p.orderCode} />,
    },
    { name: 'customer', label: 'Khách hàng', render: (p) => p.customerName },
    {
      name: 'method',
      label: 'Phương thức',
      width: 170,
      render: (p) => (
        <StatusBadge group="payment-method" statusKey={METHOD_KEY[p.method]} size="sm" />
      ),
    },
    {
      name: 'amount',
      label: 'Số tiền',
      width: 120,
      render: (p) => <Money value={p.amount} />,
    },
  ]

  const empty = isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được giao dịch"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={handleRetry}>Thử lại</Button>}
    />
  ) : (
    <EmptyState
      icon={<LuWallet size={32} />}
      title="Không có giao dịch"
      description="Khoảng này chưa có thanh toán nào được xác nhận."
    />
  )

  return (
    <Modal opened onClose={onClose} size="xl" title={title}>
      <DataTable
        columns={columns}
        data={isError ? [] : payments}
        rowKey={rowKey}
        rowProps={rowProps}
        loading={isLoading}
        empty={empty}
      />
      {payments.length > 0 && (
        <Group justify="space-between" mt="md">
          <Text c="dimmed" size="sm">
            {truncated
              ? `Chỉ hiện ${formatNumber(payments.length)} / ${formatNumber(expectedCount)} giao dịch mới nhất`
              : `${formatNumber(payments.length)} giao dịch đã xác nhận`}
          </Text>
          <Group gap="xs">
            <Text fw={600}>Tổng</Text>
            <Money value={total} />
          </Group>
        </Group>
      )}
    </Modal>
  )
}
