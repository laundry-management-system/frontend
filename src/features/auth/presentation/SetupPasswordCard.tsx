import { Alert, Button, PasswordInput, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router-dom'
import { notify } from '@/shared/lib/notify'
import { useSetupPassword } from '../application/useSetupPassword'
import { validateConfirmPassword, validateNewPassword } from '../domain/rules'
import { AuthCard } from './AuthCard'

/** Màn đặt mật khẩu lần đầu, mở từ link trong email kích hoạt. */
export function SetupPasswordCard({ token }: { token: string | null }) {
  const navigate = useNavigate()
  const { setup, isPending, failure } = useSetupPassword()
  const form = useForm({
    initialValues: { password: '', confirm: '' },
    validate: {
      password: validateNewPassword,
      confirm: (v, values) => validateConfirmPassword(v, values.password),
    },
  })
  const goLogin = () => navigate('/login', { replace: true })

  if (!token || failure === 'invalid-link') {
    return (
      <AuthCard subtitle="Thiết lập mật khẩu">
        <Alert color="danger" title="Link không hợp lệ hoặc đã hết hạn">
          Liên hệ Chủ tiệm để được gửi lại link.
        </Alert>
        <Button variant="secondary" size="lg" fullWidth onClick={goLogin}>
          Về trang đăng nhập
        </Button>
      </AuthCard>
    )
  }

  if (failure === 'already-active') {
    return (
      <AuthCard subtitle="Thiết lập mật khẩu">
        <Alert color="info" title="Tài khoản đã được kích hoạt">
          Bạn có thể đăng nhập bằng mật khẩu đã đặt.
        </Alert>
        <Button size="lg" fullWidth onClick={goLogin}>
          Đăng nhập
        </Button>
      </AuthCard>
    )
  }

  const submit = form.onSubmit(({ password }) =>
    setup(
      { token, password },
      {
        onSuccess: () => {
          notify.success('Đã thiết lập mật khẩu, vui lòng đăng nhập')
          goLogin()
        },
      },
    ),
  )

  return (
    <AuthCard subtitle="Thiết lập mật khẩu">
      <form onSubmit={submit} noValidate>
        <Stack gap={20}>
          {(failure === 'network' || failure === 'unknown') && (
            <Alert color="danger" title="Không thiết lập được mật khẩu">
              {failure === 'network'
                ? 'Không kết nối được máy chủ, vui lòng thử lại.'
                : 'Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ Chủ tiệm.'}
            </Alert>
          )}
          <PasswordInput
            label="Mật khẩu mới"
            required
            autoComplete="new-password"
            autoFocus
            {...form.getInputProps('password')}
          />
          <PasswordInput
            label="Nhập lại mật khẩu"
            required
            autoComplete="new-password"
            {...form.getInputProps('confirm')}
          />
          <Button type="submit" size="lg" fullWidth loading={isPending}>
            Xác nhận
          </Button>
        </Stack>
      </form>
    </AuthCard>
  )
}
