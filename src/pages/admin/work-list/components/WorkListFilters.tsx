import { Anchor, Group, SegmentedControl, Select, Stack, Text, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { type ChangeEvent, type KeyboardEvent, useState } from 'react'
import { LuCalendar, LuSearch } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import {
  useFindOpenOrderByCode,
  useWorkCounts,
  WORK_TAB_LABEL,
  WORK_TABS,
  type WorkTab,
} from '@/features/admin/orders'
import { useWorkListParams } from '../useWorkListParams'
import { PATHS } from '@/shared/common/config/paths'

const TABS: WorkTab[] = ['ALL', ...WORK_TABS]
const PICK_DATE = 'pick'
const PRESET_DUES = ['', 'today', 'tomorrow']
const DUE_OPTIONS = [
  { value: '', label: 'Hẹn trả: Tất cả' },
  { value: 'today', label: 'Hẹn trả: Hôm nay' },
  { value: 'tomorrow', label: 'Hẹn trả: Ngày mai' },
  { value: PICK_DATE, label: 'Hẹn trả: Chọn ngày' },
]

export function WorkListFilters() {
  const navigate = useNavigate()
  const { q, setQ, search, tab, setStatus, due, range, setDue, commitSearch } = useWorkListParams()
  const { data: counts } = useWorkCounts({ q: search, ...range })
  const findByCode = useFindOpenOrderByCode()

  // Đang ở chế độ "Chọn ngày": bật khi chọn mục đó, tự tắt khi bộ lọc ngày bị xóa từ ngoài (Xóa lọc)
  const [picking, setPicking] = useState(!PRESET_DUES.includes(due))
  const [prevDue, setPrevDue] = useState(due)
  if (due !== prevDue) {
    setPrevDue(due)
    setPicking(!PRESET_DUES.includes(due))
  }

  const handleTabChange = (v: string) => setStatus(v as WorkTab)
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  // Quét QR / gõ đúng mã rồi Enter: mở thẳng đơn; không khớp đúng một đơn thì chỉ lọc như thường
  const handleSearchKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    const code = q.trim()
    if (e.key !== 'Enter' || !code) return
    commitSearch(code)
    const hit = await findByCode(code).catch(() => null)
    if (hit) navigate(PATHS.orderDetail(hit.id))
  }
  const handleDueChange = (v: string | null) => {
    setPicking(v === PICK_DATE)
    if (v !== PICK_DATE) setDue(v ?? '')
  }
  const handleDateChange = (v: string | null) => setDue(v ?? '')

  const tabOptions = TABS.map((t) => ({
    value: t,
    label: counts ? `${WORK_TAB_LABEL[t]} (${counts[t]})` : WORK_TAB_LABEL[t],
  }))

  return (
    <Stack gap="sm" w="100%">
      <SegmentedControl value={tab} onChange={handleTabChange} data={tabOptions} />
      {counts && (
        <Group gap="md">
          <Anchor component={Link} to={`${PATHS.orders}?status=PENDING_CONFIRMATION`} size="sm">
            Chờ xác nhận ({counts.pendingConfirmation})
          </Anchor>
          <Anchor component={Link} to={`${PATHS.orders}?status=AWAITING_DROPOFF`} size="sm">
            Chờ nhận đồ ({counts.awaitingDropoff})
          </Anchor>
          <Text size="xs" c="dimmed">
            Đơn online chưa nhận đồ, chưa vào danh sách công việc
          </Text>
        </Group>
      )}
      <Group gap="sm">
        <TextInput
          w={320}
          placeholder="Lọc theo mã đơn / tên / SĐT"
          leftSection={<LuSearch size={16} />}
          value={q}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
        <Select
          w={200}
          data={DUE_OPTIONS}
          value={picking ? PICK_DATE : due}
          onChange={handleDueChange}
          allowDeselect={false}
        />
        {picking && (
          <DatePickerInput
            w={160}
            placeholder="Chọn ngày"
            valueFormat="DD/MM/YYYY"
            leftSection={<LuCalendar size={16} />}
            value={PRESET_DUES.includes(due) ? null : due}
            onChange={handleDateChange}
          />
        )}
      </Group>
    </Stack>
  )
}
