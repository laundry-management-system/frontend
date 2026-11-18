import { Button, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ConfirmModal, ModalFooter, MoneyInput } from '@/shared/admin/ui'
import { serviceAreaFormSchema } from '../application/schemas'
import { useSaveServiceArea } from '../application/useSaveServiceArea'
import type { ServiceArea, ServiceAreaFormValues } from '../domain/types'

interface ServiceAreaFormModalProps {
  opened: boolean
  onClose: () => void
  /** Có thì sửa, không thì thêm mới */
  area?: ServiceArea
}

const EMPTY_VALUES: ServiceAreaFormValues = { name: '', pickupFee: '', deliveryFee: '' }

export function ServiceAreaFormModal(props: ServiceAreaFormModalProps) {
  const { opened, onClose, area } = props
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={area ? `Sửa khu vực ${area.name}` : 'Thêm khu vực'}
      // Form tự hỏi "Bỏ thay đổi?" và không cho đóng khi đang lưu
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {opened && <ServiceAreaForm {...props} />}
    </Modal>
  )
}

function ServiceAreaForm({ onClose, area }: ServiceAreaFormModalProps) {
  const save = useSaveServiceArea()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const form = useForm<ServiceAreaFormValues>({
    initialValues: area
      ? { name: area.name, pickupFee: area.pickupFee, deliveryFee: area.deliveryFee }
      : EMPTY_VALUES,
    validate: schemaResolver(serviceAreaFormSchema, { sync: true }),
  })

  const handleError = (err: unknown) => {
    const error = toApiError(err)
    const errors = error.fieldErrors
    // Lỗi không thuộc ô nào trên form thì báo toast, tránh lưu thất bại mà không có phản hồi
    if (Object.keys(errors).some((key) => key in form.values)) form.setErrors(errors)
    // 403 đã có toast chung ở queryClient
    else if (error.status !== 403) notify.error(error.message)
  }

  const submit = form.onSubmit((values) => {
    const dto = {
      name: values.name.trim(),
      pickupFee: Number(values.pickupFee),
      deliveryFee: Number(values.deliveryFee),
    }
    save.mutate(
      { id: area?.id, dto },
      {
        onSuccess: (saved) => {
          notify.success(`${area ? 'Đã lưu' : 'Đã thêm'} khu vực ${saved.name}`)
          onClose()
        },
        onError: handleError,
      },
    )
  })

  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())
  const closeDiscard = () => setConfirmDiscard(false)

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        <TextInput
          label="Tên khu vực"
          required
          data-autofocus
          maxLength={100}
          {...form.getInputProps('name')}
        />
        <SimpleGrid cols={2}>
          <MoneyInput label="Phí lượt lấy" required {...form.getInputProps('pickupFee')} />
          <MoneyInput label="Phí lượt giao" required {...form.getInputProps('deliveryFee')} />
        </SimpleGrid>
        <ModalFooter>
          <Button variant="secondary" onClick={close} disabled={save.isPending}>
            Hủy
          </Button>
          <Button type="submit" loading={save.isPending}>
            {area ? 'Lưu' : 'Thêm khu vực'}
          </Button>
        </ModalFooter>
      </Stack>
      <ConfirmModal
        opened={confirmDiscard}
        onClose={closeDiscard}
        onConfirm={onClose}
        kind="confirm"
        title="Bỏ thay đổi?"
        confirmLabel="Bỏ thay đổi"
      >
        Các thông tin vừa nhập sẽ không được lưu.
      </ConfirmModal>
    </form>
  )
}
