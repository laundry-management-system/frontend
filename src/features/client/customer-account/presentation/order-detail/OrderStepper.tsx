import dayjs from 'dayjs'
import { LuCheck } from 'react-icons/lu'
import { buildTimeline, type TimelineInput, type TimelineState } from '../../domain/timeline'

const STATE_TEXT: Record<TimelineState, string> = {
  DONE: 'Đã xong',
  CURRENT: 'Hiện tại',
  UPCOMING: 'Sắp tới',
}

const DOT: Record<TimelineState, string> = {
  DONE: 'border-(--pub-accent) bg-(--pub-accent) text-(--pub-ink)',
  CURRENT:
    'border-[3px] border-(--pub-primary) bg-white shadow-[0_0_0_4px_var(--pub-primary-soft)]',
  UPCOMING: 'border-(--pub-border) bg-white',
}

interface Props {
  order: TimelineInput & { customerRejectReason: string | null }
}

/** Chỉ stepper cuộn ngang khi hẹp; không bọc card. */
export function OrderStepper({ order }: Props) {
  const { steps, cancelled } = buildTimeline(order)
  return (
    <div className="grid gap-3">
      {cancelled && (
        <div
          role="alert"
          className="rounded-(--pub-radius-md) bg-(--pub-danger-soft) px-3 py-2 text-(--pub-danger)"
        >
          <p className="font-semibold">Đã hủy</p>
          {order.customerRejectReason && <p>{order.customerRejectReason}</p>}
        </div>
      )}
      <ol aria-label="Tiến độ đơn" className="flex overflow-x-auto pb-1">
        {steps.map((s, i) => {
          const reached = s.state !== 'UPCOMING'
          return (
            <li
              key={s.label}
              aria-current={s.state === 'CURRENT' ? 'step' : undefined}
              className="relative grid flex-[1_0_4.25rem] content-start justify-items-center gap-1 text-center"
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-[13px] right-[calc(50%+16px)] left-[calc(-50%+16px)] border-t-2 ${reached ? 'border-(--pub-accent)' : 'border-(--pub-border)'}`}
                />
              )}
              <span
                className={`relative z-[1] grid size-7 place-items-center rounded-full border-2 ${DOT[s.state]}`}
                aria-hidden="true"
              >
                {s.state === 'DONE' && <LuCheck size={14} />}
                {s.state === 'CURRENT' && (
                  <span className="size-2 rounded-full bg-(--pub-primary)" />
                )}
              </span>
              <span
                className={`text-(length:--pub-text-sm) leading-tight md:text-(length:--pub-text-md) ${s.state === 'UPCOMING' ? 'text-(--pub-ink-muted)' : 'font-semibold'}`}
              >
                {s.label}
              </span>
              <span className="text-(length:--pub-text-sm) leading-tight text-(--pub-ink-muted)">
                {s.at ? dayjs(s.at).format('DD/MM HH:mm') : 'Chưa tới'}
              </span>
              <span className="sr-only">{STATE_TEXT[s.state]}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
