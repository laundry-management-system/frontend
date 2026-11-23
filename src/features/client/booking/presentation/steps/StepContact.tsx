import { Checkbox, Textarea, TextInput } from '@mantine/core'
import { InfoTip } from '../InfoTip'
import { useBookingFormContext } from '../../application/bookingForm'

/** Bước 4: liên hệ + điều khoản. */
export function StepContact() {
  const form = useBookingFormContext()
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        label="Họ và tên"
        required
        maxLength={100}
        autoComplete="name"
        {...form.getInputProps('contactName')}
      />
      <TextInput
        label={
          <span className="inline-flex items-center gap-1">
            Số điện thoại
            <InfoTip label="Tiệm gọi hoặc nhắn Zalo số này để xác nhận" />
          </span>
        }
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        {...form.getInputProps('contactPhone')}
      />
      <Textarea
        label="Ghi chú"
        maxLength={500}
        autosize
        minRows={2}
        {...form.getInputProps('note')}
      />
      <Checkbox
        className="mt-2"
        classNames={{
          body: 'items-start',
          label: 'text-(length:--pub-text-sm)',
          description: 'text-(length:--pub-text-sm) text-(--pub-ink-muted)',
        }}
        label="Tôi đồng ý với điều khoản dịch vụ và điều khoản bồi thường"
        description="Bồi thường tối đa 10 lần giá dịch vụ của món, không quá 500.000đ/món. Lưu đồ tối đa 30 ngày kể từ ngày hẹn."
        {...form.getInputProps('termsAccepted', { type: 'checkbox' })}
      />
    </div>
  )
}
