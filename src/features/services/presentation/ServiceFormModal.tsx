import {
  Button,
  Input,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter, MoneyInput } from '@/shared/ui'
import { serviceFormSchema } from '../application/schemas'
import { useCreateService } from '../application/useCreateService'
import { useUpdateService } from '../application/useUpdateService'
import { isPriceChanged, SERVICE_NAME_MAX, toFormValues, toServicePayload } from '../domain/rules'
import {
  SERVICE_STATUS_LABEL,
  type Service,
  type ServiceFormValues,
  type ServiceStatus,
  type ServiceUnit,
  UNIT_LABEL,
} from '../domain/types'
import { PriceChange } from './PriceChange'

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
    validate: schemaResolver(serviceFormSchema, { sync: true }),
  })
  const v = form.values
  const unitLabel = v.unit ? UNIT_LABEL[v.unit] : 'đơn vị'

  const handleError = (err: unknown) => {
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
        dto: { ...payload, status: values.status, ...(priceChangeReason && { priceChangeReason }) },
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
        <SimpleGrid cols={2}>
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
            data={UNIT_OPTIONS}
            allowDeselect={false}
            {...form.getInputProps('unit')}
          />
        </SimpleGrid>
        <SimpleGrid cols={2}>
          <MoneyInput
            label={
              <InfoLabel
                info={
                  mode === 'edit' &&
                  'Đổi giá phải nhập lý do và được ghi vào nhật ký (giá cũ, giá mới, người sửa, thời gian).'
                }
              >
                Đơn giá
              </InfoLabel>
            }
            required
            {...form.getInputProps('price')}
          />
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
        </SimpleGrid>
        <Switch
          label="Hỗ trợ giặt nhanh"
          {...form.getInputProps('expressSupported', { type: 'checkbox' })}
        />
        {v.expressSupported && (
          <SimpleGrid cols={2}>
            <MoneyInput
              label={`Phụ phí giặt nhanh (mỗi ${unitLabel})`}
              required
              {...form.getInputProps('expressSurcharge')}
            />
            <NumberInput
              label="Thời gian giặt nhanh"
              required
              min={1}
              allowDecimal={false}
              allowNegative={false}
              rightSection="giờ"
              rightSectionWidth={44}
              {...form.getInputProps('expressHours')}
            />
          </SimpleGrid>
        )}
        {mode === 'edit' && (
          <SimpleGrid cols={2}>
            <Input.Wrapper
              label={
                <InfoLabel info="Dịch vụ ngừng hoạt động không còn trong lựa chọn khi phân loại đơn mới; đơn cũ giữ nguyên.">
                  Trạng thái
                </InfoLabel>
              }
            >
              <SegmentedControl
                fullWidth
                value={v.status}
                onChange={(s) => form.setFieldValue('status', s as ServiceStatus)}
                data={(['ACTIVE', 'INACTIVE'] as ServiceStatus[]).map((s) => ({
                  value: s,
                  label: SERVICE_STATUS_LABEL[s],
                }))}
              />
            </Input.Wrapper>
          </SimpleGrid>
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
        {pricePending && initial && (
          <PriceChange oldPrice={initial.price} newPrice={Number(pricePending.price)} />
        )}
      </ConfirmModal>
    </form>
  )
}
