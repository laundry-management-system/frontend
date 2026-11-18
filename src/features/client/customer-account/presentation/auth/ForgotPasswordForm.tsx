import { TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toApiError } from '@/shared/common/api/apiError'
import { PATHS } from '@/shared/common/config/paths'
import { formatPhone } from '@/shared/common/lib/format'
import { useForgotPassword } from '../../application/mutations/useForgotPassword'
import { type ForgotValues, forgotSchema } from '../../application/schemas'
import { FIELD_CLASSES, FORM_ERROR_CLASS } from './fieldClasses'

interface ForgotPasswordFormProps {
  storePhone?: string
}

export function ForgotPasswordForm({ storePhone }: ForgotPasswordFormProps) {
  const forgot = useForgotPassword()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const form = useForm<ForgotValues>({
    initialValues: { email: '' },
    validate: schemaResolver(forgotSchema, { sync: true }),
  })

  const submit = form.onSubmit((values) => {
    setError(null)
    forgot.mutate(values.email, {
      onSuccess: () => setSent(true),
      onError: (err) => setError(toApiError(err).message),
    })
  })

  const contact = (
    <p>
      Không có email? Liên hệ tiệm
      {storePhone && (
        <>
          {' '}
          <a href={`tel:${storePhone}`} className="font-semibold underline underline-offset-4">
            {formatPhone(storePhone)}
          </a>
        </>
      )}
      .
    </p>
  )

  if (sent)
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-(--pub-radius-lg) bg-(--pub-accent-soft) p-4 font-semibold"
        >
          Nếu email tồn tại, bạn sẽ nhận được thư trong vài phút
        </p>
        {contact}
        <Link to={PATHS.customerLogin} className="pub-link">
          Về trang đăng nhập
        </Link>
      </div>
    )

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className={FORM_ERROR_CLASS}>
          {error}
        </p>
      )}
      <TextInput
        label="Email"
        withAsterisk
        type="email"
        autoComplete="email"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('email')}
      />
      <button
        type="submit"
        disabled={forgot.isPending}
        className="pub-btn pub-btn--primary pub-btn--lg w-full disabled:opacity-60"
      >
        {forgot.isPending ? 'Đang gửi…' : 'Gửi link đặt lại mật khẩu'}
      </button>
      {contact}
      <Link to={PATHS.customerLogin} className="pub-link self-start">
        Quay lại đăng nhập
      </Link>
    </form>
  )
}
