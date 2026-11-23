import { Checkbox, Group, Radio, TextInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { InfoLabel } from '@/shared/admin/ui'
import type { DeliveryValues } from '../../application/schemas'
import { InfoSection } from '../InfoRow'

export function CheckoutReceiverSection({ form }: { form: UseFormReturnType<DeliveryValues> }) {
  const proxy = form.values.mode === 'PROXY'
  return (
    <InfoSection title="Người nhận">
      <Radio.Group {...form.getInputProps('mode')}>
        <Group>
          <Radio value="SELF" label="Khách hàng tự nhận" />
          <Radio value="PROXY" label="Người nhận hộ" />
        </Group>
      </Radio.Group>
      {proxy && (
        <>
          <TextInput
            label="Họ tên người nhận"
            required
            maxLength={100}
            {...form.getInputProps('receiverName')}
          />
          <TextInput
            label="Quan hệ với khách"
            required
            maxLength={50}
            {...form.getInputProps('receiverRelation')}
          />
          <Checkbox
            label={
              <InfoLabel info="Chỉ để nhắc, hệ thống không lưu">
                Người nhận đã ký trên liên phiếu giấy
              </InfoLabel>
            }
          />
        </>
      )}
    </InfoSection>
  )
}
