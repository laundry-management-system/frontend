import { Button, Select } from '@mantine/core'
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates'
import { useState } from 'react'
import { LuCalendar } from 'react-icons/lu'
import { useUsers } from '@/features/users'
import type { AuditLogParams } from '../application/useAuditLogParams'
import { ACTION_LABEL, AUDIT_ACTIONS, ENTITY_TYPE_LABEL, ENTITY_TYPES } from '../domain/labels'

const ACTION_OPTIONS = AUDIT_ACTIONS.map((a) => ({ value: a, label: ACTION_LABEL[a] }))
const ENTITY_OPTIONS = ENTITY_TYPES.map((t) => ({ value: t, label: ENTITY_TYPE_LABEL[t] }))
const SYSTEM_OPTION = { value: '0', label: 'Hệ thống' }
// shortcut: tối đa 100 nhân viên, quá thì đổi sang ô tìm gọi API
const USER_QUERY = { page: 0, size: 100 }

type Range = DatesRangeValue<string>

export function AuditLogFilters({ params }: { params: AuditLogParams }) {
  const { filter, filtered, setRange, setUserId, setAction, setEntityType, reset } = params
  const { data: users } = useUsers(USER_QUERY)

  // Giữ ngày đầu đã chọn trong lúc chờ chọn ngày cuối; URL chỉ đổi khi đủ 2 ngày hoặc xóa
  const urlRange: Range = [filter.from ?? null, filter.to ?? null]
  const [range, setLocalRange] = useState<Range>(urlRange)
  const [syncedRange, setSyncedRange] = useState(urlRange.join())
  if (urlRange.join() !== syncedRange) {
    setSyncedRange(urlRange.join())
    setLocalRange(urlRange)
  }

  const handleRangeChange = (value: Range) => {
    setLocalRange(value)
    const [from, to] = value
    if ((from && to) || (!from && !to)) setRange(from ?? undefined, to ?? undefined)
  }
  const handleUserChange = (v: string | null) => setUserId(v ?? undefined)
  const handleActionChange = (v: string | null) => setAction(v ?? undefined)
  const handleEntityChange = (v: string | null) => setEntityType(v ?? undefined)

  const userOptions = [
    SYSTEM_OPTION,
    // User seed `system` (id 0) đã có trong lựa chọn "Hệ thống"; trùng value thì Select của Mantine crash
    ...(users?.content ?? [])
      .filter((u) => u.id !== 0)
      .map((u) => ({
        value: String(u.id),
        label: `${u.fullName} (${u.username})`,
      })),
  ]

  return (
    <>
      <DatePickerInput
        type="range"
        w={240}
        placeholder="Khoảng ngày"
        valueFormat="DD/MM/YYYY"
        leftSection={<LuCalendar size={16} />}
        maxDate={new Date()}
        clearable
        allowSingleDateInRange
        value={range}
        onChange={handleRangeChange}
      />
      <Select
        w={220}
        placeholder="Người dùng: Tất cả"
        searchable
        clearable
        data={userOptions}
        value={filter.userId != null ? String(filter.userId) : null}
        onChange={handleUserChange}
      />
      <Select
        w={220}
        placeholder="Hành động: Tất cả"
        searchable
        clearable
        data={ACTION_OPTIONS}
        value={filter.action ?? null}
        onChange={handleActionChange}
      />
      <Select
        w={200}
        placeholder="Đối tượng: Tất cả"
        clearable
        data={ENTITY_OPTIONS}
        value={filter.entityType ?? null}
        onChange={handleEntityChange}
      />
      {filtered && (
        <Button variant="subtle" onClick={reset}>
          Xóa bộ lọc
        </Button>
      )}
    </>
  )
}
