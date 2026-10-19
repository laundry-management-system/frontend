import { Anchor, Breadcrumbs, Button, Center, Group, Loader, SimpleGrid } from '@mantine/core'
import { useState } from 'react'
import { LuCloudOff, LuPlus, LuUserX } from 'react-icons/lu'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { selectHasRole, useAuthStore } from '@/features/auth'
import {
  countOpenOrders,
  CustomerFormModal,
  CustomerInfoCard,
  CustomerOrdersCard,
  useChangeCustomerStatus,
  useCustomer,
  useCustomerStats,
} from '@/features/customers'
import { toApiError } from '@/shared/api/apiError'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EmptyState, EntityCode, PageHeader, StatTile } from '@/shared/ui'

const INTAKE_ROUTE_READY = false

export default function CustomerDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const canManage = useAuthStore(selectHasRole('ADMIN'))
  const { data: customer, isLoading, error } = useCustomer(id)
  const { stats } = useCustomerStats(customer?.phone)
  const changeStatus = useChangeCustomerStatus()
  const [editing, setEditing] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [checking, setChecking] = useState(false)

  if (isLoading)
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    )

  if (!customer) {
    const loadFailed = !!error && toApiError(error).status !== 404
    return (
      <EmptyState
        icon={loadFailed ? <LuCloudOff size={32} /> : <LuUserX size={32} />}
        title={loadFailed ? 'Không tải được hồ sơ' : 'Không tìm thấy khách'}
        description={
          loadFailed
            ? 'Vui lòng kiểm tra kết nối rồi thử lại.'
            : 'Khách này không tồn tại hoặc đường dẫn không đúng.'
        }
        action={
          <Button variant="secondary" component={Link} to="/customers">
            Về danh sách khách
          </Button>
        }
      />
    )
  }

  const active = customer.status === 'ACTIVE'

  const setStatus = (status: 'ACTIVE' | 'INACTIVE') =>
    changeStatus.mutate(
      { id: customer.id, status },
      {
        onSuccess: () => {
          setConfirmDeactivate(false)
          notify.success(
            status === 'ACTIVE' ? 'Đã kích hoạt lại khách' : 'Đã ngừng hoạt động khách',
          )
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    )

  const toggleStatus = async () => {
    if (!active) return setStatus('ACTIVE')
    setChecking(true)
    try {
      const open = await countOpenOrders(customer.phone)
      if (open > 0) notify.error(`Khách còn ${open} đơn chưa đóng, chưa thể ngừng hoạt động.`)
      else setConfirmDeactivate(true)
    } catch (e) {
      notify.error(toApiError(e).message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to="/customers" size="sm">
          Khách hàng
        </Anchor>
        <span className="text-muted-foreground">
          <EntityCode code={customer.code} size="sm" />
        </span>
      </Breadcrumbs>
      <PageHeader
        title={customer.fullName}
        description={
          <>
            <EntityCode code={customer.code} /> · tạo {formatDate(customer.createdAt)} bởi{' '}
            {customer.createdBy ?? '—'}
          </>
        }
        actions={
          <Group gap="sm">
            {INTAKE_ROUTE_READY && (
              <Button
                leftSection={<LuPlus size={16} />}
                disabled={!active}
                onClick={() => navigate(`/intake?phone=${customer.phone}`)}
              >
                Tạo đơn cho khách
              </Button>
            )}
            <Button onClick={() => setEditing(true)}>Sửa</Button>
          </Group>
        }
      />

      <SimpleGrid cols={4} mb="lg">
        <StatTile label="Tổng số đơn" value={stats ? stats.orderCount : '—'} />
        <StatTile
          label="Tổng chi tiêu"
          value={stats?.totalSpent != null ? formatMoney(stats.totalSpent) : '—'}
        />
        <StatTile label="Dịch vụ thường dùng" value={stats?.topService ?? '—'} />
        <StatTile
          label="Đơn gần nhất"
          value={stats?.lastOrderAt ? formatDate(stats.lastOrderAt) : '—'}
        />
      </SimpleGrid>

      <Group align="flex-start" gap="lg" wrap="nowrap">
        <CustomerInfoCard
          customer={customer}
          canManage={canManage}
          onToggleStatus={toggleStatus}
          statusLoading={checking || changeStatus.isPending}
        />
        <CustomerOrdersCard phone={customer.phone} />
      </Group>

      <CustomerFormModal
        opened={editing}
        onClose={() => setEditing(false)}
        mode="edit"
        initial={customer}
      />
      <ConfirmModal
        opened={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={() => setStatus('INACTIVE')}
        kind="destructive"
        title={`Ngừng hoạt động khách ${customer.fullName}?`}
        confirmLabel="Ngừng hoạt động"
        loading={changeStatus.isPending}
      >
        Khách vẫn tra cứu được nhưng không tạo được đơn mới. Có thể kích hoạt lại sau.
      </ConfirmModal>
    </>
  )
}
