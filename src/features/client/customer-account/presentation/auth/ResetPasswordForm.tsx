import { PasswordInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { LuClock } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import { toApiError } from '@/shared/common/api/apiError'
import { PATHS } from '@/shared/common/config/paths'
import { notify } from '@/shared/common/lib/notify'
import { useResetPassword } from '../../application/mutations/useResetPassword'
import { type ResetValues, resetSchema } from '../../application/schemas'
import { FIELD_CLASSES, FORM_ERROR_CLASS, PASSWORD_TOGGLE_PROPS } from './fieldClasses'

interface ResetPasswordFormProps {
  token: string | null
}

function ExpiredNotice() {
  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-(--pub-radius-lg) bg-(--pub-accent-soft) p-6"
    >
      <LuClock size={32} className="text-(--pub-accent-ink)" aria-hidden="true" />
      <h2 className="text-(length:--pub-text-xl) font-semibold">Link đã hết hạn</h2>
      <p>Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.</p>
      <Link to={PATHS.customerForgotPassword} className="pub-btn pub-btn--primary self-start">
        Yêu cầu link mới
      </Link>
    </div>
  )
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const reset = useResetPassword()
  const navigate = useNavigate()
  const [expired, setExpired] = useState(!token)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ResetValues>({
    initialValues: { newPassword: '', confirmPassword: '' },
    validate: schemaResolver(resetSchema, { sync: true }),
  })

  const submit = form.onSubmit(({ newPassword }) => {
    if (!token) return
    setError(null)
    reset.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          notify.success('Đã đặt lại mật khẩu')
          navigate(PATHS.customerLogin)
        },
        onError: (err) => {
          const apiError = toApiError(err)
          if ('newPassword' in apiError.fieldErrors) form.setErrors(apiError.fieldErrors)
          else if (apiError.status === 400) setExpired(true)
          else setError(apiError.message)
        },
      },
    )
  })

  if (expired) return <ExpiredNotice />

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className={FORM_ERROR_CLASS}>
          {error}
        </p>
      )}
      <PasswordInput
        visibilityToggleButtonProps={PASSWORD_TOGGLE_PROPS}
        rightSectionWidth={44}
        label="Mật khẩu mới"
        withAsterisk
        autoComplete="new-password"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('newPassword')}
      />
      <PasswordInput
        visibilityToggleButtonProps={PASSWORD_TOGGLE_PROPS}
        rightSectionWidth={44}
        label="Nhập lại mật khẩu mới"
        withAsterisk
        autoComplete="new-password"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('confirmPassword')}
      />
      <button
        type="submit"
        disabled={reset.isPending}
        className="pub-btn pub-btn--primary pub-btn--lg w-full disabled:opacity-60"
      >
        {reset.isPending ? 'Đang lưu…' : 'Đặt lại mật khẩu'}
      </button>
    </form>
  )
}
