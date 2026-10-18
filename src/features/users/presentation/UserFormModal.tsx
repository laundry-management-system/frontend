import {
  Button,
  Group,
  Input,
  Modal,
  PasswordInput,
  SegmentedControl,
  Stack,
  TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ModalFooter } from '@/shared/ui'
import { useCreateUser, useUpdateUser } from '../application/useUserMutations'
import { ROLE_LABEL, type User } from '../domain/types'
import {
  validateFullName,
  validatePassword,
  validatePhone,
  validateUsername,
} from '../domain/rules'

interface UserFormModalProps {
  opened: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  user?: User
}

interface FormValues {
  fullName: string
  phone: string
  username: string
  password: string
  role: 'Nhân viên' | 'Admin'
  hiredDate: string | null
}

const today = () => new Date().toISOString().slice(0, 10)

export function UserFormModal({ opened, onClose, mode, user }: UserFormModalProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isEdit = mode === 'edit'

  const form = useForm<FormValues>({
    initialValues: {
      fullName: '',
      phone: '',
      username: '',
      password: '',
      role: 'Nhân viên',
      hiredDate: today(),
    },
    validate: {
      fullName: validateFullName,
      phone: validatePhone,
      username: (v) => (isEdit ? null : validateUsername(v)),
      password: (v) => (isEdit ? null : validatePassword(v)),
    },
  })
  const { getInputProps } = form

  useEffect(() => {
    if (!opened) return
    if (isEdit && user) {
      form.setValues({
        fullName: user.fullName,
        phone: user.phone,
        username: user.username,
        password: '',
        role: user.role === 'ADMIN' ? 'Admin' : 'Nhân viên',
        hiredDate: user.hiredDate,
      })
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  const handleApiError = (error: unknown) => {
    const err = toApiError(error)
    if (Object.keys(err.fieldErrors).length > 0) {
      form.setErrors(err.fieldErrors)
      return
    }
    if (err.message.includes('Tên đăng nhập')) form.setFieldError('username', err.message)
    else if (err.message.includes('Số điện thoại')) form.setFieldError('phone', err.message)
    else notify.error(err.message)
  }

  const submit = form.onSubmit((values) => {
    if (isEdit && user) {
      updateUser.mutate(
        { id: user.id, dto: { fullName: values.fullName.trim(), phone: values.phone.trim() } },
        {
          onSuccess: () => {
            notify.success('Đã cập nhật nhân viên')
            onClose()
          },
          onError: handleApiError,
        },
      )
    } else {
      createUser.mutate(
        {
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          username: values.username.trim(),
          password: values.password,
        },
        {
          onSuccess: () => {
            notify.success('Đã thêm nhân viên')
            onClose()
          },
          onError: handleApiError,
        },
      )
    }
  })

  const loading = createUser.isPending || updateUser.isPending

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Sửa nhân viên' : 'Thêm nhân viên'}
      centered
      size={560}
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          <Group grow align="flex-start">
            <TextInput label="Họ tên" required {...getInputProps('fullName')} />
            <TextInput label="Số điện thoại" placeholder="0988666777" {...getInputProps('phone')} />
          </Group>
          <Group grow align="flex-start">
            <TextInput
              label="Tài khoản"
              required={!isEdit}
              disabled={isEdit}
              {...getInputProps('username')}
            />
            {isEdit ? (
              <TextInput label="Vai trò" disabled value={ROLE_LABEL[user?.role ?? 'STAFF']} />
            ) : (
              <PasswordInput label="Mật khẩu tạm" required {...getInputProps('password')} />
            )}
          </Group>
          <Group grow align="flex-start">
            <DatePickerInput
              label="Ngày vào làm"
              valueFormat="DD/MM/YYYY"
              disabled={isEdit}
              {...getInputProps('hiredDate')}
            />
            {!isEdit && (
              <Input.Wrapper label="Vai trò">
                <SegmentedControl
                  fullWidth
                  data={['Nhân viên', 'Admin']}
                  {...getInputProps('role')}
                />
              </Input.Wrapper>
            )}
          </Group>
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? 'Lưu' : 'Tạo nhân viên'}
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
