import { PasswordInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/common/api/apiError'
import { useChangeMyPassword } from '../../application/mutations/useChangeMyPassword'
import { type ChangePasswordValues, changePasswordSchema } from '../../application/schemas'
import { FIELD_CLASSES, FORM_ERROR_CLASS, PASSWORD_TOGGLE_PROPS } from '../auth/fieldClasses'

const INITIAL: ChangePasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function ChangePasswordSection() {
  const change = useChangeMyPassword()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ChangePasswordValues>({
    initialValues: INITIAL,
    validate: schemaResolver(changePasswordSchema, { sync: true }),
  })

  const submit = form.onSubmit((values) => {
    setError(null)
    change.mutate(values, {
      onSuccess: () => form.reset(),
      onError: (err) => {
        const apiError = toApiError(err)
        if (Object.keys(apiError.fieldErrors).some((k) => k in form.values))
          form.setErrors(apiError.fieldErrors)
        else setError(apiError.message)
      },
    })
  })

  return (
    <section aria-labelledby="doi-mat-khau-title" className="pub-card p-6">
      <h2 id="doi-mat-khau-title" className="mb-5 text-(length:--pub-text-xl)">
        Đổi mật khẩu
      </h2>
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        {error && (
          <p role="alert" className={FORM_ERROR_CLASS}>
            {error}
          </p>
        )}
        <PasswordInput
          visibilityToggleButtonProps={PASSWORD_TOGGLE_PROPS}
          rightSectionWidth={44}
          label="Mật khẩu hiện tại"
          withAsterisk
          autoComplete="current-password"
          classNames={FIELD_CLASSES}
          {...form.getInputProps('currentPassword')}
        />
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
          disabled={change.isPending}
          className="pub-btn pub-btn--primary self-start disabled:opacity-60"
        >
          {change.isPending ? 'Đang lưu…' : 'Đổi mật khẩu'}
        </button>
      </form>
    </section>
  )
}
