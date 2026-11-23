import { LuChartPie } from 'react-icons/lu'
import { EmptyState } from '@/shared/admin/ui'
import { compactMoney } from '../domain/metrics'
import { pieSlices } from '../domain/report'
import type { ServiceRow } from '../domain/types'
import { OTHER_COLOR, ShareRing } from './ShareRing'

interface ServiceShareRingProps {
  rows: ServiceRow[]
}

export function ServiceShareRing({ rows }: ServiceShareRingProps) {
  const slices = pieSlices(rows)
  if (slices.length === 0)
    return (
      <EmptyState
        icon={<LuChartPie size={32} />}
        title="Chưa có doanh thu dịch vụ"
        description="Tỉ trọng doanh thu theo dịch vụ sẽ hiện ở đây."
      />
    )

  const items = slices.map((s) => ({
    key: s.name,
    label: s.name,
    value: s.value,
    color: s.name === 'Khác' ? OTHER_COLOR : undefined,
  }))
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  return <ShareRing items={items} centerLabel="Doanh thu" centerValue={compactMoney(total)} />
}
