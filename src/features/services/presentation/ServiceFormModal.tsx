import {
  Button,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { formatMoney } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, ModalFooter, MoneyInput } from '@/shared/ui'
import {
  StatusChangeError,
  useCreateService,
  useUpdateService,
} from '../application/useServiceMutations'
import {
  isPriceChanged,
  SERVICE_NAME_MAX,
  toFormValues,
  toServicePayload,
  validateServiceForm,
} from '../domain/rules'
import {
  SERVICE_STATUS_LABEL,
  type Service,
  type ServiceFormValues,
  type ServiceStatus,
  type ServiceUnit,
  UNIT_LABEL,
} from '../domain/types'

interface ServiceFormModalProps {
  opened: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  /** Bắt buộc khi mode = edit */
  initial?: Service
}

const UNIT_OPTIONS = (Object.keys(UNIT_LABEL) as ServiceUnit[]).map((u) => ({
  value: u,
  label: UNIT_LABEL[u],
}))

export function ServiceFormModal(props: ServiceFormModalProps) {
  const { opened, onClose, mode, initial } = props
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={560}
      title={
        mode === 'create' ? (
          'Thêm dịch vụ'
        ) : (
          <>
            Sửa dịch vụ <EntityCode code={initial!.code} /> – {initial!.name}
          </>
        )
      }
      // Form tự hỏi "Bỏ thay đổi?", không đóng khi bấm ra ngoài/Esc
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {opened && <ServiceForm {...props} />}
    </Modal>
  )
}

function ServiceForm({ onClose, mode, initial }: ServiceFormModalProps) {
  const create = useCreateService()
  const update = useUpdateService()
  const pending = create.isPending || update.isPending
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [pricePending, setPricePending] = useState<ServiceFormValues | null>(null)

  const form = useForm<ServiceFormValues>({
    initialValues: toFormValues(initial),
    validate: validateServiceForm,
  })
  const v = form.values
  const unitLabel = v.unit ? UNIT_LABEL[v.unit] : 'đơn vị'

  const handleError = (err: unknown) => {
    if (err instanceof StatusChangeError) {
      notify.error(
        `Đã lưu thông tin nhưng chưa đổi được trạng thái: ${toApiError(err.original).message}`,
      )
      return
    }
    const error = toApiError(err)
    if (Object.keys(error.fieldErrors).length) form.setErrors(error.fieldErrors)
    else notify.error(error.message)
  }

  const save = (values: ServiceFormValues, priceChangeReason?: string) => {
    const done = () => {
      notify.success(mode === 'create' ? 'Đã thêm dịch vụ' : 'Đã cập nhật dịch vụ')
      onClose()
    }
    const payload = toServicePayload(values)
    if (mode === 'create') {
      create.mutate(payload, { onSuccess: done, onError: handleError })
      return
    }
    update.mutate(
      {
        id: initial!.id,
        dto: priceChangeReason ? { ...payload, priceChangeReason } : payload,
        status: values.status,
        previousStatus: initial!.status,
      },
      { onSuccess: done, onError: handleError },
    )
  }

  const submit = form.onSubmit((values) =>
    isPriceChanged(initial, values) ? setPricePending(values) : save(values),
  )

  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        {mode === 'edit' && (
          <Text size="sm" c="dimmed">
            Thay đổi giá được ghi vào nhật ký (giá cũ, giá mới, người sửa, thời gian).
          </Text>
        )}
        <Group grow align="flex-start">
          <TextInput
            label="Tên dịch vụ"
            required
            data-autofocus
            maxLength={SERVICE_NAME_MAX}
            {...form.getInputProps('name')}
          />
          <Select
            label="Đơn vị tính"
            required
            maw={160}
            data={UNIT_OPTIONS}
            allowDeselect={false}
            {...form.getInputProps('unit')}
          />
        </Group>
        <Group grow align="flex-start">
          <MoneyInput label="Đơn giá" required {...form.getInputProps('price')} />
          <NumberInput
            label="Thời gian xử lý chuẩn"
            required
            min={1}
            allowDecimal={false}
            allowNegative={false}
            rightSection="giờ"
            rightSectionWidth={44}
            {...form.getInputProps('standardHours')}
          />
        </Group>
        <Switch
          label="Hỗ trợ giặt nhanh"
          {...form.getInputProps('expressSupported', { type: 'checkbox' })}
        />
        {v.expressSupported && (
          <Group grow align="flex-start">
            <MoneyInput
              label="Phụ phí giặt nhanh"
              required
              description={`Mỗi ${unitLabel}`}
              {...form.getInputProps('expressSurcharge')}
            />
            <NumberInput
              label="Thời gian giặt nhanh"
              required
              description="Ngắn hơn thời gian chuẩn"
              min={1}
              allowDecimal={false}
              allowNegative={false}
              rightSection="giờ"
              rightSectionWidth={44}
              {...form.getInputProps('expressHours')}
            />
          </Group>
        )}
        {mode === 'edit' && (
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              Trạng thái
            </Text>
            <SegmentedControl
              value={v.status}
              onChange={(s) => form.setFieldValue('status', s as ServiceStatus)}
              data={(['ACTIVE', 'INACTIVE'] as ServiceStatus[]).map((s) => ({
                value: s,
                label: SERVICE_STATUS_LABEL[s],
              }))}
              style={{ alignSelf: 'flex-start' }}
            />
            {v.status === 'INACTIVE' && (
              <Text size="xs" c="dimmed">
                Dịch vụ sẽ không còn trong lựa chọn khi phân loại đơn mới; đơn cũ giữ nguyên.
              </Text>
            )}
          </Stack>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Hủy
          </Button>
          <Button type="submit" loading={pending}>
            {mode === 'create' ? 'Thêm dịch vụ' : 'Lưu'}
          </Button>
        </ModalFooter>
      </Stack>

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
        opened={!!pricePending}
        onClose={() => setPricePending(null)}
        onConfirm={(reason) => {
          save(pricePending!, reason)
          setPricePending(null)
        }}
        kind="reason"
        title={`Đổi giá ${initial?.name ?? ''}`}
        confirmLabel="Lưu giá mới"
      >
        {formatMoney(initial?.price ?? 0)} → {formatMoney(Number(pricePending?.price ?? 0))}. Đơn đã
        tạo vẫn giữ giá cũ.
      </ConfirmModal>
    </form>
  )
}
