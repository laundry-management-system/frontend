import { PasswordInput, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toApiError } from '@/shared/common/api/apiError'
import { PATHS } from '@/shared/common/config/paths'
import { useRegister } from '../../application/mutations/useRegister'
import { type RegisterValues, registerSchema } from '../../application/schemas'
import { FIELD_CLASSES, FORM_ERROR_CLASS, PASSWORD_TOGGLE_PROPS } from './fieldClasses'
import { PendingNotice } from './PendingNotice'

interface RegisterFormProps {
  storePhone?: string
}

const INITIAL: RegisterValues = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterForm({ storePhone }: RegisterFormProps) {
  const register = useRegister()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const form = useForm<RegisterValues>({
    initialValues: INITIAL,
    validate: schemaResolver(registerSchema, { sync: true }),
  })

  const handleError = (err: unknown) => {
    const apiError = toApiError(err)
    const fields = Object.keys(apiError.fieldErrors).filter((k) => k in form.values)
    if (fields.length > 0) form.setErrors(apiError.fieldErrors)
    else setError(apiError.message)
  }

  const submit = form.onSubmit((values) => {
    setError(null)
    register.mutate(values, { onSuccess: () => setDone(true), onError: handleError })
  })

  if (done) return <PendingNotice storePhone={storePhone} />

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className={FORM_ERROR_CLASS}>
          {error}
        </p>
      )}
      <TextInput
        label="Họ tên"
        withAsterisk
        autoComplete="name"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('fullName')}
      />
      <TextInput
        label="Số điện thoại"
        withAsterisk
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('phone')}
      />
      <TextInput
        label="Email"
        type="email"
        autoComplete="email"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('email')}
      />
      <PasswordInput
        visibilityToggleButtonProps={PASSWORD_TOGGLE_PROPS}
        rightSectionWidth={44}
        label="Mật khẩu"
        withAsterisk
        autoComplete="new-password"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('password')}
      />
      <PasswordInput
        visibilityToggleButtonProps={PASSWORD_TOGGLE_PROPS}
        rightSectionWidth={44}
        label="Nhập lại mật khẩu"
        withAsterisk
        autoComplete="new-password"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('confirmPassword')}
      />
      <button
        type="submit"
        disabled={register.isPending}
        className="pub-btn pub-btn--primary pub-btn--lg w-full disabled:opacity-60"
      >
        {register.isPending ? 'Đang gửi…' : 'Tạo tài khoản'}
      </button>
      <p>
        Đã có tài khoản?{' '}
        <Link to={PATHS.customerLogin} className="pub-link">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
