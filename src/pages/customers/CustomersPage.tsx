import { Button, SegmentedControl, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { LuChevronRight, LuSearch, LuSearchX, LuUserPlus, LuUsers } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import {
  type Customer,
  CUSTOMER_STATUS_LABEL,
  type CustomerStatus,
  CustomerCell,
  CustomerFormModal,
  CustomerStatusText,
  formatPhone,
  looksLikePhone,
  useCustomers,
} from '@/features/customers'
import { useListParams } from '@/shared/hooks/useListParams'
import { EmptyState, EntityCode, IconButton, ListPage } from '@/shared/ui'

const STATUSES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly CustomerStatus[]

export default function CustomersPage() {
  const navigate = useNavigate()
  const { q, setQ, search, status, setStatus, page, setPage } = useListParams(STATUSES)
  const [modal, setModal] = useState<{ phone?: string; fullName?: string } | null>(null)

  const { data, isLoading, isError, refetch } = useCustomers({
    search,
    status: status === 'ALL' ? undefined : status,
    page: page - 1,
  })
  const total = data?.page.totalElements ?? 0
  const size = data?.page.size ?? 20
  const from = total ? (page - 1) * size + 1 : 0
  const to = Math.min(page * size, total)
  const stat = () => <Text c="dimmed">—</Text> // shortcut: chờ thống kê khách từ BE-1

  const openCreate = () => {
    const term = search.trim()
    setModal(!term ? {} : looksLikePhone(term) ? { phone: term } : { fullName: term })
  }

  return (
    <>
      <ListPage<Customer>
        title="Khách hàng"
        description={`${total.toLocaleString('vi-VN')} khách`}
        primaryAction={{ label: 'Thêm khách', onClick: () => setModal({}) }}
        filters={
          <>
            <TextInput
              w={360}
              placeholder="Số điện thoại hoặc họ tên"
              leftSection={<LuSearch size={16} />}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
            />
            <SegmentedControl
              value={status}
              onChange={(v) => setStatus(v as CustomerStatus | 'ALL')}
              data={[
                { label: 'Tất cả', value: 'ALL' },
                { label: CUSTOMER_STATUS_LABEL.ACTIVE, value: 'ACTIVE' },
                { label: CUSTOMER_STATUS_LABEL.INACTIVE, value: 'INACTIVE' },
              ]}
            />
          </>
        }
        columns={[
          {
            name: 'code',
            label: 'Mã KH',
            width: 110,
            render: (c) => <EntityCode code={c.code} />,
          },
          { name: 'fullName', label: 'Họ và tên', render: (c) => <CustomerCell customer={c} /> },
          {
            name: 'phone',
            label: 'Số điện thoại',
            width: 140,
            render: (c) => formatPhone(c.phone),
          },
          { name: 'orderCount', label: 'Số đơn', width: 100, align: 'center', render: stat },
          { name: 'totalSpent', label: 'Tổng chi tiêu', width: 140, align: 'center', render: stat },
          { name: 'lastOrderAt', label: 'Đơn gần nhất', width: 130, render: stat },
          {
            name: 'status',
            label: 'Trạng thái',
            width: 140,
            render: (c) => <CustomerStatusText status={c.status} />,
          },
          {
            name: 'open',
            label: '',
            width: 60,
            align: 'right',
            render: (c) => (
              <IconButton
                label={`Mở hồ sơ ${c.fullName}`}
                icon={<LuChevronRight size={18} />}
                onClick={() => navigate(`/customers/${c.id}`)}
              />
            ),
          },
        ]}
        data={data?.content ?? []}
        rowKey={(c) => c.id}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        rowProps={(c) => ({
          onClick: () => navigate(`/customers/${c.id}`),
          style: { cursor: 'pointer', opacity: c.status === 'INACTIVE' ? 0.6 : undefined },
        })}
        empty={
          search.trim() ? (
            <EmptyState
              icon={<LuSearchX size={32} />}
              title="Không tìm thấy khách"
              description={`Không có khách nào khớp "${search.trim()}".`}
              action={
                <Button leftSection={<LuUserPlus size={16} />} onClick={openCreate}>
                  Thêm khách
                </Button>
              }
            />
          ) : status !== 'ALL' ? (
            <EmptyState
              icon={<LuSearchX size={32} />}
              title={`Không có khách ${CUSTOMER_STATUS_LABEL[status].toLowerCase()}`}
              action={
                <Button variant="secondary" onClick={() => setStatus('ALL')}>
                  Xem tất cả khách
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<LuUsers size={32} />}
              title="Chưa có khách hàng"
              description="Khách mới thêm sẽ hiện ở đây."
            />
          )
        }
        page={page}
        totalPages={data?.page.totalPages}
        onPageChange={setPage}
      >
        {total > 0 && (
          <Text size="sm" c="dimmed" mt="xs">
            Hiển thị {from}–{to} / {total.toLocaleString('vi-VN')} khách
          </Text>
        )}
      </ListPage>

      <CustomerFormModal
        opened={!!modal}
        onClose={() => setModal(null)}
        mode="create"
        prefill={modal ?? undefined}
        onSaved={(c) => navigate(`/customers/${c.id}`)}
      />
    </>
  )
}
