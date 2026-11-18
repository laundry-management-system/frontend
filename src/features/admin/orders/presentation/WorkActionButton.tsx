import { Button } from '@mantine/core'
import { type MouseEvent, useState } from 'react'
import type { IconType } from 'react-icons'
import { LuCheck, LuPlay, LuTags } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { useStartProcessing } from '../application/mutations/useStartProcessing'
import type { OrderListItem } from '../domain/types'
import { nextAction, type WorkAction } from '../domain/workList'
import { CompleteOrderLauncher } from './CompleteOrderLauncher'
import { PATHS } from '@/shared/common/config/paths'

const ACTIONS: Record<WorkAction, { label: string; icon: IconType }> = {
  classify: { label: 'Phân loại', icon: LuTags },
  start: { label: 'Bắt đầu xử lý', icon: LuPlay },
  complete: { label: 'Hoàn thành', icon: LuCheck },
}

// Sự kiện trong modal (portal) vẫn nổi lên cây React tới dòng bảng → chặn để không mở chi tiết đơn
const stopPropagation = (e: MouseEvent) => e.stopPropagation()

/** Nút chuyển bước tiếp theo của đơn ngay trên dòng, tự xử lý cả ba bước (Phân loại / Bắt đầu / Hoàn thành).
 * Cùng một kiểu cho mọi dòng: mức gấp đã thể hiện bằng vạch màu và nhãn TRỄ / Giặt nhanh. */
export function WorkActionButton({ order }: { order: OrderListItem }) {
  const navigate = useNavigate()
  const startProcessing = useStartProcessing()
  const [completing, setCompleting] = useState(false)
  const action = nextAction(order)
  if (!action) return null

  const closeComplete = () => setCompleting(false)
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (action === 'classify') navigate(`${PATHS.classify}?order=${order.id}`)
    else if (action === 'complete') setCompleting(true)
    else
      startProcessing.mutate(order.id, {
        onSuccess: () => notify.success('Đã chuyển sang Đang xử lý'),
        onError: (err) => notify.error(toApiError(err).message),
      })
  }

  const { label, icon: Icon } = ACTIONS[action]
  return (
    <>
      <Button
        size="xs"
        variant="secondary"
        leftSection={<Icon size={14} aria-hidden />}
        loading={startProcessing.isPending}
        onClick={handleClick}
      >
        {label}
      </Button>
      {completing && (
        <span onClick={stopPropagation}>
          <CompleteOrderLauncher orderId={order.id} onClose={closeComplete} />
        </span>
      )}
    </>
  )
}
