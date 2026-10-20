import { Button, Group, Input, Modal, SegmentedControl, Stack, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ModalFooter } from '@/shared/ui'
import { useCreateUser, useUpdateUser } from '../application/useUserMutations'
import { ROLE_LABEL, type Role, type User } from '../domain/types'
import { validateEmail, validateFullName, validatePhone } from '../domain/rules'

interface UserFormModalProps {
  opened: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  user?: User
}

interface FormValues {
  fullName: string
  phone: string
  email: string
  role: Role
  hiredDate: string | null
}

const ROLE_OPTIONS = [
  { label: ROLE_LABEL.STAFF, value: 'STAFF' },
  { label: ROLE_LABEL.ADMIN, value: 'ADMIN' },
]

const today = () => new Date().toISOString().slice(0, 10)

export function UserFormModal({ opened, onClose, mode, user }: UserFormModalProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isEdit = mode === 'edit'

  const form = useForm<FormValues>({
    initialValues: { fullName: '', phone: '', email: '', role: 'STAFF', hiredDate: today() },
    validate: {
      fullName: validateFullName,
      phone: validatePhone,
      // Email không sửa được ở chế độ sửa (API sửa chưa nhận email)
      email: (v) => (isEdit ? null : validateEmail(v)),
    },
  })
  const { getInputProps } = form

  useEffect(() => {
    if (!opened) return
    if (isEdit && user) {
      form.setValues({
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
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
    if (err.message.includes('Email')) form.setFieldError('email', err.message)
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
          email: values.email.trim(),
          hiredDate: values.hiredDate,
          role: values.role,
        },
        {
          onSuccess: (created) => {
            notify.success(
              `Đã gửi email kích hoạt tới ${created.email}. Tên đăng nhập: ${created.username}`,
            )
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
            <TextInput
              label="Số điện thoại"
              placeholder="0988666777"
              required
              {...getInputProps('phone')}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput
              label="Email"
              type="email"
              placeholder="nhanvien@gmail.com"
              required={!isEdit}
              disabled={isEdit}
              {...getInputProps('email')}
            />
            {isEdit ? (
              <TextInput label="Tài khoản" disabled value={user?.username ?? ''} />
            ) : (
              <DatePickerInput
                label="Ngày vào làm"
                valueFormat="DD/MM/YYYY"
                {...getInputProps('hiredDate')}
              />
            )}
          </Group>
          {isEdit ? (
            <Group grow align="flex-start">
              <DatePickerInput
                label="Ngày vào làm"
                valueFormat="DD/MM/YYYY"
                disabled
                {...getInputProps('hiredDate')}
              />
              <TextInput label="Vai trò" disabled value={ROLE_LABEL[user?.role ?? 'STAFF']} />
            </Group>
          ) : (
            <Input.Wrapper label="Vai trò">
              <SegmentedControl fullWidth data={ROLE_OPTIONS} {...getInputProps('role')} />
            </Input.Wrapper>
          )}
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
