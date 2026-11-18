import { PasswordInput, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toApiError } from '@/shared/common/api/apiError'
import { PATHS } from '@/shared/common/config/paths'
import { useCustomerLogin } from '../../application/mutations/useCustomerLogin'
import { type LoginValues, loginSchema } from '../../application/schemas'
import { FIELD_CLASSES, FORM_ERROR_CLASS, PASSWORD_TOGGLE_PROPS } from './fieldClasses'

interface LoginFormProps {
  onSuccess: () => void
}

const INITIAL: LoginValues = { identifier: '', password: '' }

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useCustomerLogin()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginValues>({
    initialValues: INITIAL,
    validate: schemaResolver(loginSchema, { sync: true }),
  })

  const submit = form.onSubmit((values) => {
    setError(null)
    login.mutate(values, {
      onSuccess,
      onError: (err) => setError(toApiError(err).message),
    })
  })

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className={FORM_ERROR_CLASS}>
          {error}
        </p>
      )}
      <TextInput
        label="Email hoặc số điện thoại"
        withAsterisk
        autoComplete="username"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('identifier')}
      />
      <PasswordInput
        visibilityToggleButtonProps={PASSWORD_TOGGLE_PROPS}
        rightSectionWidth={44}
        label="Mật khẩu"
        withAsterisk
        autoComplete="current-password"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('password')}
      />
      <button
        type="submit"
        disabled={login.isPending}
        className="pub-btn pub-btn--primary pub-btn--lg w-full disabled:opacity-60"
      >
        {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
      <div className="flex flex-wrap justify-between gap-x-4">
        <Link to={PATHS.customerForgotPassword} className="pub-link">
          Quên mật khẩu?
        </Link>
        <Link to={PATHS.customerRegister} className="pub-link">
          Tạo tài khoản
        </Link>
      </div>
    </form>
  )
}
