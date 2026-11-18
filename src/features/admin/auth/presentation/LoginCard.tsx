import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect, useState } from 'react'
import { useLogin } from '../application/useLogin'
import { formatCountdown } from '../domain/rules'
import { AuthCard } from './AuthCard'
import type { LoginFailureKind } from '../domain/types'

const FAILURE_ALERT: Record<Exclude<LoginFailureKind, 'validation'>, [string, string]> = {
  invalid: [
    'Sai tài khoản hoặc mật khẩu',
    'Kiểm tra lại rồi thử lại. Sai nhiều lần tài khoản sẽ bị khóa tạm thời.',
  ],
  locked: [
    'Tài khoản tạm khóa 15 phút',
    'Đăng nhập sai quá 5 lần. Liên hệ Chủ tiệm nếu cần mở khóa sớm.',
  ],
  disabled: ['Tài khoản đã bị vô hiệu hóa', 'Liên hệ Chủ tiệm để được kích hoạt lại.'],
  network: ['Không kết nối được máy chủ', 'Vui lòng kiểm tra mạng rồi thử lại.'],
}

export function LoginCard() {
  const { login, isPending, failure, fieldErrors, isLockedFor, remainingMs } = useLogin()
  const [capsLock, setCapsLock] = useState(false)
  const form = useForm({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (v.trim() ? null : 'Vui lòng nhập tài khoản'),
      password: (v) => (v ? null : 'Vui lòng nhập mật khẩu'),
    },
  })

  const locked = isLockedFor(form.values.username)
  const alert =
    failure && failure !== 'validation' && (failure !== 'locked' || locked)
      ? FAILURE_ALERT[failure]
      : null

  useEffect(() => {
    if (failure === 'validation') form.setErrors(fieldErrors)
    // chỉ chạy khi có kết quả lỗi mới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failure, fieldErrors])

  const submit = form.onSubmit((values) =>
    login(values, {
      onError: () => {
        form.setFieldValue('password', '')
        form.getInputNode('password')?.focus()
      },
    }),
  )

  return (
    <AuthCard subtitle="Đăng nhập dành cho Chủ tiệm và Nhân viên">
      <form onSubmit={submit} noValidate>
        <Stack gap={20}>
          {alert && (
            <Alert color="danger" title={alert[0]}>
              {alert[1]}
            </Alert>
          )}

          <TextInput
            label="Tài khoản"
            placeholder="nv01"
            required
            autoComplete="username"
            autoFocus
            {...form.getInputProps('username')}
            error={
              form.errors.username ??
              (failure === 'invalid' ? 'Kiểm tra lại tài khoản / mật khẩu' : undefined)
            }
          />
          <PasswordInput
            label="Mật khẩu"
            required
            autoComplete="current-password"
            disabled={locked}
            description={capsLock ? 'Caps Lock đang bật' : undefined}
            onKeyUp={(e) => setCapsLock(e.getModifierState('CapsLock'))}
            {...form.getInputProps('password')}
          />
          <Button type="submit" size="lg" fullWidth loading={isPending} disabled={locked}>
            {locked ? `Thử lại sau ${formatCountdown(remainingMs)}` : 'Đăng nhập'}
          </Button>
        </Stack>
      </form>
    </AuthCard>
  )
}
