import { SegmentedControl } from '@mantine/core'
import { ORDER_CHANNEL_LABEL, type OrderChannel } from '@/features/admin/orders'

const ALL = 'ALL'
const DATA = [
  { value: ALL, label: 'Tất cả kênh' },
  { value: 'ONLINE', label: ORDER_CHANNEL_LABEL.ONLINE },
  { value: 'OFFLINE', label: ORDER_CHANNEL_LABEL.OFFLINE },
]

interface ChannelFilterProps {
  value?: OrderChannel
  onChange: (channel?: OrderChannel) => void
}

export function ChannelFilter({ value, onChange }: ChannelFilterProps) {
  const handleChange = (v: string) => onChange(v === ALL ? undefined : (v as OrderChannel))
  return (
    <SegmentedControl
      aria-label="Lọc theo kênh"
      data={DATA}
      value={value ?? ALL}
      onChange={handleChange}
    />
  )
}
