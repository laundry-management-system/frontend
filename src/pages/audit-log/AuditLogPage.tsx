import { Badge, Button, Group, Stack, Text, Tooltip } from '@mantine/core'
import dayjs from 'dayjs'
import { LuFileText, LuSearchX } from 'react-icons/lu'
import {
  actionLabel,
  actorName,
  AuditLogDrawer,
  AuditLogFilters,
  type AuditLogSummary,
  entityLabel,
  pageRangeText,
  useAuditLogParams,
  useAuditLogs,
} from '@/features/audit-log'
import { formatDateTime } from '@/shared/lib/format'
import { type DataTableColumn, EmptyState, EntityCode, ListPage } from '@/shared/ui'

const COLUMNS: DataTableColumn<AuditLogSummary>[] = [
  {
    name: 'createdAt',
    label: 'Thời gian',
    width: 130,
    render: (l) => (
      <Tooltip label={formatDateTime(l.createdAt)}>
        <Text size="sm">{dayjs(l.createdAt).format('DD/MM HH:mm')}</Text>
      </Tooltip>
    ),
  },
  {
    name: 'user',
    label: 'Người dùng',
    width: 200,
    render: (l) => (
      <Stack gap={0}>
        <Text fw={500}>{actorName(l)}</Text>
        {l.userId !== 0 && l.username && (
          <Text size="sm" c="dimmed">
            {l.username}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    name: 'action',
    label: 'Hành động',
    width: 180,
    render: (l) => <Badge variant="light">{actionLabel(l.action)}</Badge>,
  },
  {
    name: 'entity',
    label: 'Đối tượng',
    width: 180,
    render: (l) => {
      const { label, code } = entityLabel(l)
      return (
        <Group gap={6}>
          <Text size="sm">{label}</Text>
          {code && <EntityCode code={code} size="sm" />}
        </Group>
      )
    },
  },
  { name: 'ip', label: 'IP', width: 130, render: (l) => l.ipAddress ?? '—' },
]

export default function AuditLogPage() {
  const params = useAuditLogParams()
  const { filter, filtered, setPage, reset, openLogId, openLog, closeLog } = params
  const { data, isLoading, isError, refetch } = useAuditLogs(filter)
  const total = data?.page.totalElements ?? 0
  const rows = data?.content ?? []

  const handleRetry = () => refetch()
  const rowKey = (l: AuditLogSummary) => l.id
  const rowProps = (l: AuditLogSummary) => ({
    onClick: () => openLog(l.id),
    style: { cursor: 'pointer' },
  })

  const filters = <AuditLogFilters params={params} />

  const empty = filtered ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không có bản ghi phù hợp"
      description="Thử đổi khoảng ngày, người dùng hoặc hành động."
      action={
        <Button variant="secondary" onClick={reset}>
          Xóa bộ lọc
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<LuFileText size={32} />}
      title="Chưa có nhật ký"
      description="Các thao tác quan trọng sẽ hiện ở đây."
    />
  )

  const rangeText = total > 0 && data && (
    <Text size="sm" c="dimmed" mt="sm">
      {pageRangeText(filter.page, data.page.size, rows.length, total)}
    </Text>
  )

  return (
    <>
      <ListPage<AuditLogSummary>
        title="Nhật ký hệ thống"
        description={`Chỉ đọc – không sửa, không xóa · ${total.toLocaleString('vi-VN')} bản ghi`}
        filters={filters}
        columns={COLUMNS}
        data={rows}
        rowKey={rowKey}
        loading={isLoading}
        error={isError}
        onRetry={handleRetry}
        rowProps={rowProps}
        page={filter.page}
        totalPages={data?.page.totalPages ?? 0}
        onPageChange={setPage}
        empty={empty}
      >
        {rangeText}
      </ListPage>
      <AuditLogDrawer id={openLogId} onClose={closeLog} />
    </>
  )
}
