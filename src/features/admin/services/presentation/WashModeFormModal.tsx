import {
  Button,
  Center,
  Input,
  Loader,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { type ChangeEvent, useEffect, useState } from 'react'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter } from '@/shared/admin/ui'
import { useSaveWashMode } from '../application/mutations/useSaveWashMode'
import { useActiveServices } from '../application/queries/useActiveServices'
import { useWashMode } from '../application/queries/useWashMode'
import { type WashModeFormValues, washModeFormSchema } from '../application/schemas'
import type { Service, WashModeDetail } from '../domain/types'
import { ServicePriceTable } from './ServicePriceTable'

interface WashModeFormModalProps {
  opened: boolean
  onClose: () => void
  /** Có = sửa, không = thêm */
  modeId?: number
}

export function WashModeFormModal({ opened, onClose, modeId }: WashModeFormModalProps) {
  const { data: current } = useWashMode(opened ? (modeId ?? null) : null)
  const title =
    modeId == null ? (
      'Thêm hình thức giặt'
    ) : current ? (
      <>
        Sửa hình thức giặt <EntityCode code={current.code} /> – {current.name}
      </>
    ) : (
      'Sửa hình thức giặt'
    )
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={720}
      title={title}
      // Form tự hỏi "Bỏ thay đổi?", không đóng khi bấm ra ngoài/Esc
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {opened && <WashModeLoader onClose={onClose} modeId={modeId} />}
    </Modal>
  )
}

function WashModeLoader({ onClose, modeId }: Omit<WashModeFormModalProps, 'opened'>) {
  const detail = useWashMode(modeId ?? null)
  const services = useActiveServices()
  const failed = detail.isError || services.isError

  useEffect(() => {
    if (!failed) return
    notify.error('Không tải được hình thức giặt')
    onClose()
  }, [failed, onClose])

  if (!services.data || (modeId != null && !detail.data))
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  return <WashModeForm onClose={onClose} initial={detail.data} services={services.data} />
}

// BE trả "services[0].price", @mantine/form dùng "services.0.price"
const toFormPath = (key: string) => key.replace(/\[(\d+)\]/g, '.$1')

function WashModeForm({
  onClose,
  initial,
  services,
}: {
  onClose: () => void
  initial?: WashModeDetail
  services: Service[]
}) {
  const save = useSaveWashMode()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [pending, setPending] = useState<WashModeFormValues | null>(null)

  const form = useForm<WashModeFormValues>({
    initialValues: initial
      ? { ...initial, services: initial.services }
      : {
          name: '',
          completionHours: '',
          active: true,
          isDefault: false,
          services: [],
        },
    validate: schemaResolver(washModeFormSchema, { sync: true }),
  })
  const v = form.values
  const wasDefault = !!initial?.isDefault

  const linked = new Set(v.services.map((r) => r.serviceId))
  // Đổi mặc định: dịch vụ không có giá cho hình thức này sẽ bị cảnh báo / ẩn khi tạo đơn (FR-035)
  const unpriced =
    pending && pending.isDefault && !wasDefault ? services.filter((s) => !linked.has(s.id)) : []

  const handleError = (err: unknown) => {
    const error = toApiError(err)
    const errors = Object.fromEntries(
      Object.entries(error.fieldErrors).map(([k, msg]) => [toFormPath(k), msg]),
    )
    // "services" (không kèm chỉ số) là lỗi chung của bảng, hiện dưới bảng
    if (Object.keys(errors).some((k) => k.split('.')[0] in form.values)) form.setErrors(errors)
    else notify.error(error.message)
  }

  const submitValues = (values: WashModeFormValues) => {
    setPending(null)
    save.mutate(
      {
        id: initial?.id,
        dto: {
          name: values.name.trim(),
          completionHours: Number(values.completionHours),
          active: values.active,
          isDefault: values.isDefault,
          services: values.services.map((r) => ({
            serviceId: r.serviceId,
            price: Number(r.price),
          })),
        },
      },
      {
        onSuccess: () => {
          notify.success(initial ? 'Đã cập nhật hình thức giặt' : 'Đã thêm hình thức giặt')
          onClose()
        },
        onError: handleError,
      },
    )
  }

  const needsConfirm = (values: WashModeFormValues) => values.isDefault && !wasDefault
  const submit = form.onSubmit((values) =>
    needsConfirm(values) ? setPending(values) : submitValues(values),
  )
  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())

  const handleDefaultChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.currentTarget.checked
    form.setFieldValue('isDefault', checked)
    if (checked) form.setFieldValue('active', true)
  }
  const defaultInfo = wasDefault
    ? 'Muốn đổi, hãy đặt hình thức khác làm mặc định.'
    : 'Được chọn sẵn khi tạo đơn và đặt online. Dịch vụ không có giá cho hình thức mặc định sẽ bị ẩn khi tạo đơn.'
  const closeDiscard = () => setConfirmDiscard(false)
  const closePending = () => setPending(null)
  const confirmPending = () => submitValues(pending!)

  const nameList = (list: Service[]) => (
    <Text size="sm" c="dimmed" mah={160} style={{ overflowY: 'auto' }}>
      {list.map((s) => s.name).join(', ')}
    </Text>
  )

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Tên hình thức"
            required
            data-autofocus
            maxLength={50}
            {...form.getInputProps('name')}
          />
          <NumberInput
            label="Thời gian hoàn thành (giờ)"
            required
            min={1}
            max={720}
            allowDecimal={false}
            allowNegative={false}
            {...form.getInputProps('completionHours')}
          />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Switch
            label={<InfoLabel info={defaultInfo}>Hình thức mặc định</InfoLabel>}
            disabled={wasDefault}
            checked={v.isDefault}
            onChange={handleDefaultChange}
            error={form.errors.isDefault}
          />
        </SimpleGrid>
        <Input.Wrapper
          label={
            <InfoLabel info="Chỉ chọn dịch vụ có sẵn. Bỏ dịch vụ khỏi bảng là bỏ liên kết, không xoá dịch vụ.">
              Dịch vụ và giá
            </InfoLabel>
          }
          error={form.errors.services}
        >
          <ServicePriceTable form={form} services={services} modeId={initial?.id} />
        </Input.Wrapper>
        <ModalFooter>
          <Button variant="secondary" onClick={close} disabled={save.isPending}>
            Hủy
          </Button>
          <Button type="submit" loading={save.isPending}>
            {initial ? 'Lưu' : 'Thêm hình thức'}
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
      <ConfirmModal
        opened={!!pending}
        onClose={closePending}
        onConfirm={confirmPending}
        kind="confirm"
        title="Đổi hình thức mặc định?"
        confirmLabel="Lưu"
      >
        <Stack gap="sm">
          {pending?.isDefault && !wasDefault && (
            <>
              <Text size="sm">
                {unpriced.length
                  ? `${unpriced.length} dịch vụ chưa có giá cho hình thức này sẽ bị cảnh báo và ẩn khi tạo đơn, đặt online:`
                  : 'Mọi dịch vụ đều có giá cho hình thức này.'}
              </Text>
              {unpriced.length > 0 && nameList(unpriced)}
            </>
          )}
        </Stack>
      </ConfirmModal>
    </form>
  )
}
