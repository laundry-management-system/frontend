import { Button, Select } from '@mantine/core'
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates'
import { useState } from 'react'
import { LuCalendar } from 'react-icons/lu'
import { useUsers } from '@/features/admin/users'
import { useServices } from '../application/queries/useServices'
import type { PriceHistoryParams } from '../application/usePriceHistoryParams'
import { PRICE_FIELD_LABEL, PRICE_FIELDS } from '../domain/types'

const FIELD_OPTIONS = PRICE_FIELDS.map((f) => ({ value: f, label: PRICE_FIELD_LABEL[f] }))
// shortcut: tối đa 100 dịch vụ / nhân viên trong ô chọn, quá thì đổi sang ô tìm gọi API
const SERVICE_QUERY = { search: '', page: 0, size: 100 }
const USER_QUERY = { page: 0, size: 100 }

type Range = DatesRangeValue<string>

export function PriceHistoryFilters({ params }: { params: PriceHistoryParams }) {
  const { filter, filtered, setFilter, reset } = params
  const { data: services } = useServices(SERVICE_QUERY)
  const { data: users } = useUsers(USER_QUERY)

  // Giữ ngày đầu đã chọn trong lúc chờ chọn ngày cuối; URL chỉ đổi khi đủ 2 ngày
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
    if (from && to) setFilter({ from, to })
  }
  const handleServiceChange = (v: string | null) => setFilter({ serviceId: v ?? undefined })
  const handleUserChange = (v: string | null) => setFilter({ userId: v ?? undefined })
  const handleFieldChange = (v: string | null) => setFilter({ field: v ?? undefined })

  const serviceOptions = (services?.content ?? []).map((s) => ({
    value: String(s.id),
    label: `${s.code} · ${s.name}`,
  }))
  const userOptions = (users?.content ?? [])
    // User seed `system` (id 0) không sửa giá được
    .filter((u) => u.id !== 0)
    .map((u) => ({ value: String(u.id), label: `${u.fullName} (${u.username})` }))

  return (
    <>
      <Select
        w={220}
        placeholder="Dịch vụ: Tất cả"
        searchable
        clearable
        data={serviceOptions}
        value={filter.serviceId != null ? String(filter.serviceId) : null}
        onChange={handleServiceChange}
      />
      <DatePickerInput
        type="range"
        w={240}
        placeholder="Khoảng ngày"
        valueFormat="DD/MM/YYYY"
        leftSection={<LuCalendar size={16} />}
        maxDate={new Date()}
        allowSingleDateInRange
        value={range}
        onChange={handleRangeChange}
      />
      <Select
        w={220}
        placeholder="Người sửa: Tất cả"
        searchable
        clearable
        data={userOptions}
        value={filter.userId != null ? String(filter.userId) : null}
        onChange={handleUserChange}
      />
      <Select
        w={220}
        placeholder="Loại thay đổi: Tất cả"
        clearable
        data={FIELD_OPTIONS}
        value={filter.field ?? null}
        onChange={handleFieldChange}
      />
      {filtered && (
        <Button variant="subtle" onClick={reset}>
          Đặt lại
        </Button>
      )}
    </>
  )
}
