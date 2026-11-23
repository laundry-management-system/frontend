import { useId, useState } from 'react'
import { LuTrash2 } from 'react-icons/lu'
import { toApiError } from '@/shared/common/api/apiError'
import { useApplyMyOrderVoucher } from '../../application/mutations/useApplyMyOrderVoucher'

interface VoucherFormProps {
  orderCode: string
  initialCode?: string
  onDone?: () => void
  onCancel?: () => void
  onRemove?: () => void
  removing?: boolean
}

export function VoucherForm({
  orderCode,
  initialCode = '',
  onDone,
  onCancel,
  onRemove,
  removing,
}: VoucherFormProps) {
  const [code, setCode] = useState(initialCode)
  const inputId = useId()
  const apply = useApplyMyOrderVoucher(orderCode)
  const error = apply.error ? toApiError(apply.error) : null
  const message =
    error && error.status !== 429 ? (error.fieldErrors.voucherCode ?? error.message) : null
  return (
    <form
      noValidate
      className="grid w-full gap-2"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onCancel) {
          e.stopPropagation()
          onCancel()
        }
      }}
      onSubmit={(e) => {
        e.preventDefault()
        if (code.trim() && !apply.isPending) apply.mutate(code, { onSuccess: onDone })
      }}
    >
      <label htmlFor={inputId} className="font-semibold">
        Mã voucher
      </label>
      <div
        className={`flex h-12 overflow-hidden rounded-(--pub-radius-btn) border bg-(--pub-surface) focus-within:border-(--pub-primary) focus-within:ring-2 focus-within:ring-(--pub-primary-soft) ${message ? 'border-(--pub-danger)' : 'border-(--pub-border)'}`}
      >
        <input
          id={inputId}
          value={code}
          autoFocus={!!onCancel}
          disabled={apply.isPending}
          aria-invalid={!!message}
          aria-describedby={message ? `${inputId}-error` : undefined}
          onChange={(e) => {
            setCode(e.currentTarget.value)
            apply.reset()
          }}
          className="min-w-0 flex-1 bg-transparent px-3 outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={apply.isPending || !code.trim()}
          className="cursor-pointer bg-(--pub-primary) px-4 font-semibold text-(--pub-on-primary) disabled:cursor-default disabled:opacity-60"
        >
          {apply.isPending ? 'Đang áp dụng…' : 'Áp dụng'}
        </button>
      </div>
      <p
        id={`${inputId}-error`}
        role="alert"
        className="text-(length:--pub-text-sm) text-(--pub-danger) empty:hidden"
      >
        {message}
      </p>
      {(onCancel || onRemove) && (
        <div className="flex flex-wrap items-center gap-x-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-11 cursor-pointer text-(length:--pub-text-sm) font-semibold text-(--pub-ink-muted) hover:text-(--pub-ink)"
            >
              Huỷ
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              className="flex min-h-11 cursor-pointer items-center gap-1.5 text-(length:--pub-text-sm) font-semibold text-(--pub-danger) disabled:opacity-60"
            >
              <LuTrash2 size={16} aria-hidden="true" />
              Gỡ voucher
            </button>
          )}
        </div>
      )}
      <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
        Bạn có thể sửa hoặc gỡ voucher cho tới khi báo đã thanh toán.
      </p>
    </form>
  )
}
