import { Anchor, Button, Modal, Stack, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toApiError } from '@/shared/api/apiError'
import { formatPersonName, stripDigits } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, ModalFooter } from '@/shared/ui'
import {
  findCustomerByPhone,
  useCreateCustomer,
  useUpdateCustomer,
} from '../application/useCustomerMutations'
import {
  CUSTOMER_LIMITS,
  formatPhone,
  isDuplicatePhoneError,
  normalizePhone,
  toCustomerPayload,
  validateCustomerForm,
} from '../domain/rules'
import type { Customer, CustomerFormValues } from '../domain/types'

interface CustomerFormModalProps {
  opened: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  initial?: Customer
  prefill?: { phone?: string; fullName?: string }
  onSaved?: (customer: Customer) => void
}

export function CustomerFormModal(props: CustomerFormModalProps) {
  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={props.mode === 'create' ? 'Thêm khách' : 'Sửa thông tin khách'}
      centered
      size={520}
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {props.opened && <CustomerForm {...props} />}
    </Modal>
  )
}

function CustomerForm({ onClose, mode, initial, prefill, onSaved }: CustomerFormModalProps) {
  const create = useCreateCustomer()
  const update = useUpdateCustomer()
  const pending = create.isPending || update.isPending
  const [duplicateOwner, setDuplicateOwner] = useState<Customer | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [confirmPhone, setConfirmPhone] = useState<CustomerFormValues | null>(null)

  const form = useForm<CustomerFormValues>({
    initialValues: {
      fullName: initial?.fullName ?? prefill?.fullName ?? '',
      phone: initial?.phone ?? prefill?.phone ?? '',
      address: initial?.address ?? '',
      note: initial?.note ?? '',
    },
    validate: validateCustomerForm,
  })

  const handleError = async (err: unknown) => {
    const error = toApiError(err)
    if (isDuplicatePhoneError(error)) {
      form.setFieldError('phone', 'Số điện thoại đã thuộc khách khác')
      const owner = await findCustomerByPhone(normalizePhone(form.values.phone.trim()))
      setDuplicateOwner(owner && owner.id !== initial?.id ? owner : null)
      return
    }
    if (Object.keys(error.fieldErrors).length) form.setErrors(error.fieldErrors)
    else notify.error(error.message)
  }

  const save = (values: CustomerFormValues) => {
    const dto = toCustomerPayload({ ...values, fullName: formatPersonName(values.fullName) })
    const done = (customer: Customer) => {
      notify.success(mode === 'create' ? 'Đã thêm khách' : 'Đã cập nhật khách')
      onSaved?.(customer)
      onClose()
    }
    if (mode === 'create') create.mutate(dto, { onSuccess: done, onError: handleError })
    else update.mutate({ id: initial!.id, dto }, { onSuccess: done, onError: handleError })
  }

  const submit = form.onSubmit((values) => {
    setDuplicateOwner(null)
    const phoneChanged = mode === 'edit' && normalizePhone(values.phone.trim()) !== initial!.phone
    if (phoneChanged) setConfirmPhone(values)
    else save(values)
  })

  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())
  const remaining = (field: 'address' | 'note') =>
    `Còn ${CUSTOMER_LIMITS[field] - form.values[field].length} ký tự`

  const fields = (
    <>
      <TextInput
        label="Họ và tên"
        required
        data-autofocus
        maxLength={CUSTOMER_LIMITS.fullName}
        {...form.getInputProps('fullName')}
        onChange={(e) => form.setFieldValue('fullName', stripDigits(e.currentTarget.value))}
        onBlur={(e) => {
          form.setFieldValue('fullName', formatPersonName(e.currentTarget.value))
          form.getInputProps('fullName').onBlur?.()
        }}
      />
      <TextInput
        label="Số điện thoại"
        required
        inputMode="numeric"
        placeholder="0901 234 567"
        {...form.getInputProps('phone')}
        error={
          form.errors.phone && (
            <>
              {form.errors.phone}
              {duplicateOwner && (
                <>
                  {' · '}
                  <Anchor
                    component={Link}
                    to={`/customers/${duplicateOwner.id}`}
                    size="xs"
                    onClick={onClose}
                  >
                    Xem hồ sơ {duplicateOwner.fullName}
                  </Anchor>
                </>
              )}
            </>
          )
        }
      />
      <TextInput
        label="Địa chỉ"
        maxLength={CUSTOMER_LIMITS.address}
        description={remaining('address')}
        {...form.getInputProps('address')}
      />
      <Textarea
        label="Ghi chú"
        autosize
        minRows={3}
        maxLength={CUSTOMER_LIMITS.note}
        description={remaining('note')}
        {...form.getInputProps('note')}
      />
    </>
  )

  const dialogs = (
    <>
      <ConfirmModal
        opened={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={onClose}
        kind="confirm"
        title="Bỏ thay đổi?"
        confirmLabel="Bỏ thay đổi"
      >
        Các thông tin vừa nhập sẽ không được lưu.
      </ConfirmModal>
      <ConfirmModal
        opened={!!confirmPhone}
        onClose={() => setConfirmPhone(null)}
        onConfirm={() => {
          save(confirmPhone!)
          setConfirmPhone(null)
        }}
        kind="confirm"
        title="Đổi số điện thoại?"
        confirmLabel="Đổi số"
      >
        Từ {formatPhone(initial?.phone ?? '')} sang{' '}
        {formatPhone(normalizePhone(confirmPhone?.phone.trim() ?? ''))}. Đơn cũ đang gắn theo số cũ
        nên sẽ không còn hiện trong lịch sử của khách.
      </ConfirmModal>
    </>
  )

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        {fields}
        <ModalFooter>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Hủy
          </Button>
          <Button type="submit" loading={pending}>
            {mode === 'create' ? 'Thêm khách' : 'Lưu'}
          </Button>
        </ModalFooter>
      </Stack>

      {dialogs}
    </form>
  )
}
