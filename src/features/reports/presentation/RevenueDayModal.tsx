import { Button, Group, Modal, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { LuCloudOff, LuWallet } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { formatNumber } from '@/shared/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  DataTable,
  EmptyState,
  Money,
  StatusBadge,
} from '@/shared/ui'
import { useRevenuePayments } from '../application/useRevenuePayments'
import type { RevenuePayment } from '../domain/types'

const METHOD_KEY = { CASH: 'cash', BANK_TRANSFER: 'qr' } as const

interface RevenueDayModalProps {
  /** yyyy-MM-dd */
  date: string
  onClose: () => void
}

/** Các giao dịch được cộng vào doanh thu của một ngày; tổng khớp với cột trên biểu đồ. */
export function RevenueDayModal({ date, onClose }: RevenueDayModalProps) {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useRevenuePayments({ from: date, to: date })
  const payments = data ?? []
  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  const handleRetry = () => refetch()
  const rowKey = (p: RevenuePayment) => p.paymentId
  const rowProps = (p: RevenuePayment) => ({
    onClick: () => navigate(`/orders/${p.orderId}`),
    style: { cursor: 'pointer' },
  })

  const columns: DataTableColumn<RevenuePayment>[] = [
    { name: 'time', label: 'Giờ', width: 70, render: (p) => dayjs(p.paidAt).format('HH:mm') },
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
      align: 'right',
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
      description="Ngày này chưa có thanh toán nào được xác nhận."
    />
  )

  return (
    <Modal
      opened
      onClose={onClose}
      size="xl"
      title={`Doanh thu ngày ${dayjs(date).format('DD/MM/YYYY')}`}
    >
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
            {formatNumber(payments.length)} giao dịch đã xác nhận
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
