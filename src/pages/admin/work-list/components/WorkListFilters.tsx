import { FILTER_SELECT_PROPS } from '@/shared/admin/ui'
import { Select, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { type ChangeEvent, type KeyboardEvent, useState } from 'react'
import { LuCalendar, LuSearch } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { useWashModes } from '@/features/admin/services'
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
  const { q, setQ, search, tab, setStatus, modeId, setMode, due, range, setDue, commitSearch } =
    useWorkListParams()
  const { data: modes = [] } = useWashModes()
  const { data: counts } = useWorkCounts({ q: search, ...range })
  const findByCode = useFindOpenOrderByCode()

  // Đang ở chế độ "Chọn ngày": bật khi chọn mục đó, tự tắt khi bộ lọc ngày bị xóa từ ngoài (Xóa lọc)
  const [picking, setPicking] = useState(!PRESET_DUES.includes(due))
  const [prevDue, setPrevDue] = useState(due)
  if (due !== prevDue) {
    setPrevDue(due)
    setPicking(!PRESET_DUES.includes(due))
  }

  const handleTabChange = (v: string | null) => setStatus(v as WorkTab)
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
    label: counts
      ? `Trạng thái: ${WORK_TAB_LABEL[t]} (${counts[t]})`
      : `Trạng thái: ${WORK_TAB_LABEL[t]}`,
  }))

  // Hình thức đang hoạt động luôn hiện (kể cả 0 đơn); đã ngừng chỉ hiện khi còn đơn mở
  const modeOptions = [
    { value: '', label: 'Hình thức: Tất cả' },
    ...modes
      .filter((m) => m.active || (counts?.byMode[m.id] ?? 0) > 0)
      .map((m) => ({
        value: String(m.id),
        label: `Hình thức: ${m.name}${m.active ? '' : ' (ngừng)'} (${counts?.byMode[m.id] ?? 0})`,
      })),
  ]

  return (
    <>
      <Select
        {...FILTER_SELECT_PROPS}
        w={300}
        value={tab}
        onChange={handleTabChange}
        data={tabOptions}
        allowDeselect={false}
      />

      <TextInput
        w={320}
        placeholder="Lọc theo mã đơn / tên / SĐT"
        leftSection={<LuSearch size={16} />}
        value={q}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        w={300}
        data={modeOptions}
        value={modeId ? String(modeId) : ''}
        onChange={setMode}
        allowDeselect={false}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        w={220}
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
    </>
  )
}
