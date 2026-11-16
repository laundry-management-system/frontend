import { Button, Drawer, Group, Skeleton, Stack, Table, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuCloudOff, LuFileX } from 'react-icons/lu'
import { settingLabel } from '@/features/settings'
import { useUserName } from '@/features/users'
import { toApiError } from '@/shared/api/apiError'
import { formatDateTime } from '@/shared/lib/format'
import { EmptyState, EntityCode } from '@/shared/ui'
import { useAuditLog } from '../application/useAuditLog'
import { diffFields } from '../domain/diff'
import { actionLabel, actorName, entityLabel } from '../domain/labels'
import type { AuditLogDetail } from '../domain/types'

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <Text size="sm" c="dimmed" w={110} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" component="div">
        {children}
      </Text>
    </Group>
  )
}

function EntityValue({ log }: { log: AuditLogDetail }) {
  if (log.entityType === 'SETTING') {
    const key = log.newData?.settingKey ?? log.oldData?.settingKey
    return <>{typeof key === 'string' ? settingLabel(key) : 'Tham số'}</>
  }
  const { label, code } = entityLabel(log)
  return (
    <Group gap={6}>
      {label}
      {code && <EntityCode code={code} size="sm" />}
    </Group>
  )
}

// Log cũ lưu Instant thành số giây (float); log mới lưu chuỗi ISO
const formatAt = (v: unknown) =>
  typeof v === 'number'
    ? formatDateTime(new Date(v * 1000))
    : typeof v === 'string'
      ? formatDateTime(v)
      : v

const readable = (data: Record<string, unknown> | null) =>
  data &&
  Object.fromEntries(Object.entries(data).map(([k, v]) => [k, k.endsWith('At') ? formatAt(v) : v]))

function UserName({ id }: { id: number }) {
  return <>{useUserName(id)}</>
}

/** Trường `…By` là id người dùng: hiện tên thay cho số */
const renderValue = (key: string, value: string) =>
  key.endsWith('By') && /^\d+$/.test(value) ? <UserName id={Number(value)} /> : value

function DetailBody({ log }: { log: AuditLogDetail }) {
  const diffs = diffFields(readable(log.oldData), readable(log.newData))

  const changes = diffs.length ? (
    <Table withTableBorder layout="fixed">
      <Table.Thead>
        <Table.Tr>
          <Table.Th w="30%">Trường</Table.Th>
          <Table.Th>Cũ</Table.Th>
          <Table.Th>Mới</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {diffs.map((d) => (
          <Table.Tr
            key={d.key}
            bg={d.changed ? 'var(--mantine-color-yellow-light)' : undefined}
            c={d.changed ? undefined : 'dimmed'}
          >
            <Table.Td>{d.key}</Table.Td>
            <Table.Td style={{ wordBreak: 'break-word' }}>{renderValue(d.key, d.old)}</Table.Td>
            <Table.Td style={{ wordBreak: 'break-word' }} fw={d.changed ? 600 : undefined}>
              {renderValue(d.key, d.new)}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  ) : (
    <EmptyState title="Không có dữ liệu thay đổi" />
  )

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={5}>Thông tin</Title>
        <InfoRow label="Người dùng">{actorName(log)}</InfoRow>
        <InfoRow label="Tài khoản">{log.username ?? '—'}</InfoRow>
        <InfoRow label="IP">{log.ipAddress ?? '—'}</InfoRow>
        <InfoRow label="Đối tượng">
          <EntityValue log={log} />
        </InfoRow>
      </Stack>
      {log.reason && (
        <Stack gap="xs">
          <Title order={5}>Lý do</Title>
          <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
            {log.reason}
          </Text>
        </Stack>
      )}
      <Stack gap="xs">
        <Title order={5}>Thay đổi</Title>
        {changes}
      </Stack>
    </Stack>
  )
}

export function AuditLogDrawer({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data, isLoading, isError, error, refetch } = useAuditLog(id)
  const handleRetry = () => refetch()

  const title = data
    ? `${actionLabel(data.action)} · ${formatDateTime(data.createdAt)}`
    : 'Chi tiết nhật ký'

  const body = data ? (
    <DetailBody log={data} />
  ) : isError ? (
    toApiError(error).status === 404 ? (
      <EmptyState
        icon={<LuFileX size={32} />}
        title="Không tìm thấy bản ghi"
        description="Bản ghi nhật ký này không tồn tại."
      />
    ) : (
      <EmptyState
        icon={<LuCloudOff size={32} />}
        title="Không tải được chi tiết"
        description="Vui lòng kiểm tra kết nối rồi thử lại."
        action={<Button onClick={handleRetry}>Thử lại</Button>}
      />
    )
  ) : (
    isLoading && (
      <Stack>
        <Skeleton h={120} />
        <Skeleton h={200} />
      </Stack>
    )
  )

  return (
    <Drawer opened={id != null} onClose={onClose} position="right" size="lg" title={title}>
      {body}
    </Drawer>
  )
}
