import type { OrderMilestones, OrderStatus, ReturnStatus } from './types'

export type TimelineState = 'DONE' | 'CURRENT' | 'UPCOMING'

export interface TimelineStep {
  label: string
  state: TimelineState
  at: string | null
}

export interface TimelineInput {
  status: OrderStatus
  milestones: OrderMilestones
  fulfillment: { returnMethod: 'AT_STORE' | 'DELIVERY'; returnStatus: ReturnStatus | null } | null
}

const RANK: Partial<Record<OrderStatus, number>> = {
  RECEIVED: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  DELIVERED: 4,
}

/** 5 bước (trả tại tiệm) hoặc 6 bước (giao tận nơi); đơn hủy chỉ giữ các bước đã đạt. */
export function buildTimeline(order: TimelineInput): { steps: TimelineStep[]; cancelled: boolean } {
  const { status, milestones: m, fulfillment } = order
  const cancelled = status === 'CANCELLED'
  const rank = RANK[status] ?? 0
  const delivery = fulfillment?.returnMethod === 'DELIVERY'
  const returnStatus = fulfillment?.returnStatus
  const finalDone =
    status === 'DELIVERED' || returnStatus === 'DELIVERED' || returnStatus === 'CUSTOMER_COLLECTED'

  const completed = {
    label: delivery ? 'Giặt xong' : 'Hoàn thành',
    done: !!m.completedAt || rank >= 3,
    at: m.completedAt,
  }
  const raw: { label: string; done: boolean; at: string | null }[] = [
    { label: 'Đặt đơn', done: true, at: m.placedAt },
    { label: 'Nhận đồ', done: !!m.receivedAt || rank >= 1, at: m.receivedAt },
    { label: 'Đang xử lý', done: !!m.processingAt || rank >= 2, at: m.processingAt },
    completed,
    ...(delivery
      ? [
          { label: 'Đang giao', done: finalDone, at: m.deliveringAt },
          { label: 'Đã nhận', done: finalDone, at: finalDone ? m.deliveredAt : null },
        ]
      : [
          {
            label: finalDone ? 'Đã nhận' : 'Sẵn sàng nhận',
            done: finalDone,
            at: finalDone ? m.deliveredAt : null,
          },
        ]),
  ]

  let currentTaken = cancelled
  const steps = raw
    .filter((s) => !cancelled || s.done)
    .map(({ label, done, at }): TimelineStep => {
      if (done) return { label, state: 'DONE', at }
      if (currentTaken) return { label, state: 'UPCOMING', at }
      currentTaken = true
      return { label, state: 'CURRENT', at }
    })
  return { steps, cancelled }
}
