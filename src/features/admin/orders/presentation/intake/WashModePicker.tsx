import { Input, SegmentedControl } from '@mantine/core'
import type { WashMode } from '@/features/admin/services'

interface WashModePickerProps {
  modes: WashMode[]
  value: number
  error?: string
  onChange: (id: number) => void
}

/** Bước 2: chọn hình thức giặt cho cả lượt (một lượt = một đơn); hiện số giờ hoàn thành. */
export function WashModePicker({ modes, value, error, onChange }: WashModePickerProps) {
  const handleChange = (v: string) => onChange(Number(v))
  const data = modes.map((m) => ({
    value: String(m.id),
    label: `${m.name} · ${m.completionHours} giờ`,
  }))

  return (
    <Input.Wrapper error={error}>
      <SegmentedControl
        fullWidth
        orientation={modes.length > 3 ? 'vertical' : 'horizontal'}
        value={String(value)}
        onChange={handleChange}
        data={data}
      />
    </Input.Wrapper>
  )
}
