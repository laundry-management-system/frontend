import { ActionIcon, Badge, Menu, SegmentedControl, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { LuEllipsisVertical, LuSearch } from 'react-icons/lu'
import {
  ROLE_LABEL,
  STATUS_LABEL,
  type User,
  type UserStatus,
  UserFormModal,
  useDisableUser,
  useEnableUser,
  useResendSetupMail,
  useUsers,
} from '@/features/users'
import { DEFAULT_PAGE_SIZE } from '@/shared/config/constants'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { formatDate } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, type DataTableColumn, EmptyState, ListPage } from '@/shared/ui'

type StatusFilter = 'ALL' | UserStatus

export default function UsersPage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(keyword, 300)

  const onKeyword = (v: string) => {
    setKeyword(v)
    setPage(1)
  }
  const onStatus = (v: string) => {
    setStatus(v as StatusFilter)
    setPage(1)
  }

  const { data, isLoading, isError, refetch } = useUsers({
    keyword: debounced.trim() || undefined,
    status: status === 'ALL' ? undefined : status,
    page: page - 1,
    size: DEFAULT_PAGE_SIZE,
  })

  const disableUser = useDisableUser()
  const enableUser = useEnableUser()
  const resendSetupMail = useResendSetupMail()

  const [formOpened, setFormOpened] = useState(false)
  const [editing, setEditing] = useState<User | undefined>()
  const [toDisable, setToDisable] = useState<User | undefined>()
  const [toActivate, setToActivate] = useState<User | undefined>()
  const [toResend, setToResend] = useState<User | undefined>()

  const openCreate = () => {
    setEditing(undefined)
    setFormOpened(true)
  }
  const openEdit = (user: User) => {
    setEditing(user)
    setFormOpened(true)
  }

  const confirmDisable = () => {
    if (!toDisable) return
    disableUser.mutate(toDisable.id, {
      onSuccess: () => {
        notify.success('Đã vô hiệu hóa nhân viên')
        setToDisable(undefined)
      },
      onError: (e) => notify.error(e.message),
    })
  }

  const confirmActivate = () => {
    if (!toActivate) return
    enableUser.mutate(toActivate.id, {
      onSuccess: () => {
        notify.success('Đã kích hoạt lại nhân viên')
        setToActivate(undefined)
      },
      onError: (e) => notify.error(e.message),
    })
  }

  const confirmResend = () => {
    if (!toResend) return
    const { email } = toResend
    resendSetupMail.mutate(toResend.id, {
      onSuccess: () => {
        notify.success(`Đã gửi lại link tới ${email}`)
        setToResend(undefined)
      },
      onError: (e) => notify.error(e.message),
    })
  }

  const users = data?.content ?? []
  const total = data?.page.totalElements ?? 0
  const totalPages = data?.page.totalPages ?? 1

  const filters = (
    <>
      <TextInput
        leftSection={<LuSearch size={16} />}
        placeholder="Tìm theo mã / họ tên / SĐT / email"
        aria-label="Tìm theo mã / họ tên / SĐT / email"
        value={keyword}
        onChange={(e) => onKeyword(e.currentTarget.value)}
        w={320}
      />
      <SegmentedControl
        value={status}
        onChange={onStatus}
        data={[
          { label: 'Tất cả', value: 'ALL' },
          { label: 'Đang làm', value: 'ACTIVE' },
          { label: 'Ngừng hoạt động', value: 'INACTIVE' },
        ]}
      />
    </>
  )

  const columns: DataTableColumn<User>[] = [
    { name: 'employeeCode', label: 'Mã', width: 70 },
    { name: 'fullName', label: 'Họ tên', width: 250 },
    { name: 'phone', label: 'Số điện thoại', width: 140 },
    { name: 'email', label: 'Email' },
    { name: 'username', label: 'Tài khoản', width: 140 },
    {
      name: 'role',
      label: 'Vai trò',
      width: 130,
      render: (u) => (
        <Badge variant={u.role === 'ADMIN' ? 'filled' : 'light'}>{ROLE_LABEL[u.role]}</Badge>
      ),
    },
    {
      name: 'hiredDate',
      label: 'Ngày vào làm',
      width: 150,
      render: (u) => (u.hiredDate ? formatDate(u.hiredDate) : '—'),
    },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 150,
      render: (u) =>
        u.status === 'INACTIVE' ? (
          <Text c="dimmed" inherit style={{ whiteSpace: 'nowrap' }}>
            {STATUS_LABEL.INACTIVE}
          </Text>
        ) : (
          <Badge color="success" variant="light">
            {STATUS_LABEL.ACTIVE}
          </Badge>
        ),
    },
    {
      name: 'actions',
      label: '',
      width: 40,
      align: 'right',
      render: (u) => (
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <ActionIcon variant="subtle" color="neutral" aria-label="Thao tác">
              <LuEllipsisVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => openEdit(u)}>Sửa</Menu.Item>
            {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
              <Menu.Item color="red" onClick={() => setToDisable(u)}>
                Vô hiệu hóa
              </Menu.Item>
            )}
            {u.status === 'INACTIVE' && (
              <>
                <Menu.Item onClick={() => setToResend(u)}>Gửi lại link kích hoạt</Menu.Item>
                <Menu.Item onClick={() => setToActivate(u)}>Kích hoạt lại</Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ]

  return (
    <ListPage
      title="Nhân viên"
      description={`${total} tài khoản`}
      primaryAction={{ label: 'Thêm nhân viên', onClick: openCreate }}
      filters={filters}
      columns={columns}
      data={users}
      rowKey={(u) => u.id}
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      empty={
        <EmptyState title="Chưa có nhân viên" description="Bấm Thêm nhân viên để tạo tài khoản." />
      }
      rowProps={(u) => ({ opacity: u.status === 'INACTIVE' ? 0.55 : 1 })}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    >
      <UserFormModal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        mode={editing ? 'edit' : 'create'}
        user={editing}
      />
      <ConfirmModal
        opened={!!toDisable}
        onClose={() => setToDisable(undefined)}
        onConfirm={confirmDisable}
        kind="destructive"
        title="Vô hiệu hóa nhân viên"
        confirmLabel="Vô hiệu hóa"
        loading={disableUser.isPending}
      >
        {toDisable &&
          `Tài khoản "${toDisable.fullName}" sẽ chuyển sang Ngừng hoạt động. Có thể kích hoạt lại sau.`}
      </ConfirmModal>
      <ConfirmModal
        opened={!!toResend}
        onClose={() => setToResend(undefined)}
        onConfirm={confirmResend}
        kind="confirm"
        title="Gửi lại link kích hoạt"
        confirmLabel="Gửi"
        loading={resendSetupMail.isPending}
      >
        {toResend && `Gửi link mới tới ${toResend.email}? Link cũ sẽ hết hiệu lực.`}
      </ConfirmModal>
      <ConfirmModal
        opened={!!toActivate}
        onClose={() => setToActivate(undefined)}
        onConfirm={confirmActivate}
        kind="confirm"
        title="Kích hoạt lại nhân viên"
        confirmLabel="Kích hoạt lại"
        loading={enableUser.isPending}
      >
        Nếu nhân viên này chưa đặt mật khẩu, hãy dùng &quot;Gửi lại link kích hoạt&quot; — kích hoạt
        lại sẽ khiến link đặt mật khẩu không dùng được.
      </ConfirmModal>
    </ListPage>
  )
}
