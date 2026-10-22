import { Badge, Button, SegmentedControl, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { LuSearch, LuSearchX, LuUsers } from 'react-icons/lu'
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
import { useListParams } from '@/shared/hooks/useListParams'
import { formatDate } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, type DataTableColumn, EmptyState, ListPage, RowActions } from '@/shared/ui'

const STATUSES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly UserStatus[]

type ModalState =
  { kind: 'create' } | { kind: 'edit' | 'disable' | 'activate' | 'resend'; user: User } | null

export default function UsersPage() {
  const { q, setQ, search, status, setStatus, page, setPage, filtered, reset } =
    useListParams(STATUSES)

  const { data, isLoading, isError, refetch } = useUsers({
    keyword: search.trim() || undefined,
    status: status === 'ALL' ? undefined : status,
    page: page - 1,
    size: DEFAULT_PAGE_SIZE,
  })

  const disableUser = useDisableUser()
  const enableUser = useEnableUser()
  const resendSetupMail = useResendSetupMail()

  const [modal, setModal] = useState<ModalState>(null)
  const close = () => setModal(null)
  const target = modal && modal.kind !== 'create' ? modal.user : undefined

  const run = (mutation: { mutate: (id: number, opts: object) => void }, success: string) => {
    if (!target) return
    mutation.mutate(target.id, {
      onSuccess: () => {
        notify.success(success)
        close()
      },
      onError: (e: Error) => notify.error(e.message),
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
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        w={320}
      />
      <SegmentedControl
        value={status}
        onChange={(v) => setStatus(v as UserStatus | 'ALL')}
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
        <RowActions
          items={[
            { label: 'Sửa', onClick: () => setModal({ kind: 'edit', user: u }) },
            {
              label: 'Vô hiệu hóa',
              danger: true,
              hidden: !(u.status === 'ACTIVE' && u.role !== 'ADMIN'),
              onClick: () => setModal({ kind: 'disable', user: u }),
            },
            {
              label: 'Gửi lại link kích hoạt',
              hidden: u.status !== 'INACTIVE',
              onClick: () => setModal({ kind: 'resend', user: u }),
            },
            {
              label: 'Kích hoạt lại',
              hidden: u.status !== 'INACTIVE',
              onClick: () => setModal({ kind: 'activate', user: u }),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <ListPage
      title="Nhân viên"
      description={`${total} tài khoản`}
      primaryAction={{ label: 'Thêm nhân viên', onClick: () => setModal({ kind: 'create' }) }}
      filters={filters}
      columns={columns}
      data={users}
      rowKey={(u) => u.id}
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      empty={
        filtered ? (
          <EmptyState
            icon={<LuSearchX size={32} />}
            title="Không tìm thấy nhân viên"
            description={
              search.trim() ? `Không có nhân viên nào khớp "${search.trim()}".` : undefined
            }
            action={
              <Button variant="secondary" onClick={reset}>
                Xóa bộ lọc
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<LuUsers size={32} />}
            title="Chưa có nhân viên"
            description="Nhân viên mới thêm sẽ hiện ở đây."
            action={<Button onClick={() => setModal({ kind: 'create' })}>Thêm nhân viên</Button>}
          />
        )
      }
      rowProps={(u) => ({ opacity: u.status === 'INACTIVE' ? 0.55 : 1 })}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    >
      <UserFormModal
        opened={modal?.kind === 'create' || modal?.kind === 'edit'}
        onClose={close}
        mode={modal?.kind === 'edit' ? 'edit' : 'create'}
        user={modal?.kind === 'edit' ? modal.user : undefined}
      />
      <ConfirmModal
        opened={modal?.kind === 'disable'}
        onClose={close}
        onConfirm={() => run(disableUser, 'Đã vô hiệu hóa nhân viên')}
        kind="destructive"
        title="Vô hiệu hóa nhân viên"
        confirmLabel="Vô hiệu hóa"
        loading={disableUser.isPending}
      >
        {target &&
          `Tài khoản "${target.fullName}" sẽ chuyển sang Ngừng hoạt động. Có thể kích hoạt lại sau.`}
      </ConfirmModal>
      <ConfirmModal
        opened={modal?.kind === 'resend'}
        onClose={close}
        onConfirm={() => run(resendSetupMail, `Đã gửi lại link tới ${target?.email}`)}
        kind="confirm"
        title="Gửi lại link kích hoạt"
        confirmLabel="Gửi"
        loading={resendSetupMail.isPending}
      >
        {target && `Gửi link mới tới ${target.email}? Link cũ sẽ hết hiệu lực.`}
      </ConfirmModal>
      <ConfirmModal
        opened={modal?.kind === 'activate'}
        onClose={close}
        onConfirm={() => run(enableUser, 'Đã kích hoạt lại nhân viên')}
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
