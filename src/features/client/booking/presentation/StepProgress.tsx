import { Progress } from '@mantine/core'
import { LuCheck } from 'react-icons/lu'
import type { BookingStep } from '../domain/draft'

interface StepProgressProps {
  step: BookingStep
  titles: Record<BookingStep, string>
  /** Quay lại một bước đã xong; giống nút "Quay lại", không kiểm tra lại. */
  onGoTo: (step: BookingStep) => void
  disabled: boolean
}

const STEPS = [1, 2, 3, 4, 5] as const

type StepState = 'done' | 'current' | 'todo'

const stepState = (s: BookingStep, step: BookingStep): StepState =>
  s < step ? 'done' : s === step ? 'current' : 'todo'

/** Vòng số của một bước: số khi chưa xong, dấu tích khi đã xong. */
export function StepNumber({ step, state }: { step: BookingStep; state: StepState }) {
  return (
    <span className="bk-num" data-state={state} aria-hidden="true">
      {state === 'done' ? <LuCheck size={20} strokeWidth={3} /> : step}
    </span>
  )
}

/** Thanh 5 bước: desktop hiện đủ 5 vòng số kèm tên, mobile "Bước n/5 · tên" + thanh tiến độ. */
export function StepProgress({ step, titles, onGoTo, disabled }: StepProgressProps) {
  return (
    <nav aria-label="Các bước đặt đơn" className="lg:col-span-2">
      <div className="flex flex-col gap-2 md:hidden">
        <p className="font-semibold">
          Bước {step}/5 · {titles[step]}
        </p>
        <Progress
          value={step * 20}
          color="var(--pub-primary)"
          bg="var(--pub-surface-alt)"
          size="md"
          radius="xl"
          aria-hidden="true"
        />
      </div>
      <ol className="bk-steps hidden md:grid">
        {STEPS.map((s) => {
          const state = stepState(s, step)
          const body = (
            <>
              <StepNumber step={s} state={state} />
              <span>
                {titles[s]}
                {state === 'done' && <span className="sr-only"> (đã xong)</span>}
              </span>
            </>
          )
          return (
            <li
              key={s}
              className="bk-step"
              data-state={state}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {state === 'done' ? (
                <button
                  type="button"
                  onClick={() => onGoTo(s)}
                  disabled={disabled}
                  className="bk-step-body"
                >
                  {body}
                </button>
              ) : (
                <span className="bk-step-body">{body}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
