import type { ReactNode } from 'react'
import { Alert, Input, Radio, Select, type SelectProps, Stack, TextInput } from '@mantine/core'
import { LuCheck } from 'react-icons/lu'
import { formatMoney } from '@/shared/common/lib/format'
import { useBookingFormContext } from '../../application/bookingForm'
import type { BookingArea, BookingSettings, BookingStore } from '../../domain/types'

interface Props {
  storeAddress: string
  store: BookingStore
  areas: readonly BookingArea[]
  settings: BookingSettings
  storePhone: string | null
}

function Choice({ value, title, desc }: { value: string; title: string; desc: string }) {
  return (
    <Radio.Card value={value} className="bk-check bk-choice">
      <Radio.Indicator icon={LuCheck} mt={2} />
      <span className="min-w-0">
        <span className="bk-caps block">{title}</span>
        <span className="block text-(length:--pub-text-sm) text-(--pub-ink-muted)">{desc}</span>
      </span>
    </Radio.Card>
  )
}

const feeText = (v: number) => (v === 0 ? 'Miễn phí' : formatMoney(v))

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-4 rounded-(--pub-radius-xl) border-[1.5px] border-(--pub-border) p-5">
      <legend className="mx-auto px-2 text-(length:--pub-text-lg) font-bold tracking-wide uppercase">{title}</legend>
      {children}
    </fieldset>
  )
}

const GROUP = 'mt-1 grid gap-3 sm:grid-cols-2'

export function StepMethod({ storeAddress, store, areas, settings, storePhone }: Props) {
  const form = useBookingFormContext()
  const { dropoffMethod, returnMethod, pickupAddress, deliveryAddress } = form.values
  const doorEnabled = settings.deliveryEnabled && areas.length > 0
  const pickup = dropoffMethod === 'PICKUP'
  const delivery = returnMethod === 'DELIVERY'
  const { pickupAreaId, deliveryAreaId } = form.values
  const pickupArea = areas.find((a) => a.id === pickupAreaId)
  const deliveryArea = areas.find((a) => a.id === deliveryAreaId)

  const onReturn = (value: string) => {
    form.setFieldValue('returnMethod', value as typeof returnMethod)
    if (value === 'DELIVERY' && !deliveryAddress.trim())
      form.setFieldValue('deliveryAddress', pickupAddress)
    if (value === 'DELIVERY' && pickup && deliveryAreaId === null) form.setFieldValue('deliveryAreaId', pickupAreaId)
  }

  const addressGroup = (dir: 'pickup' | 'delivery', showHint: boolean) => {
    const isPickup = dir === 'pickup'
    const key = isPickup ? 'pickupAreaId' : 'deliveryAreaId'
    const verb = isPickup ? 'lấy' : 'giao'
    const feeOf = (a: BookingArea) => feeText(isPickup ? a.pickupFee : a.deliveryFee)
    const current = isPickup ? pickupArea : deliveryArea
    const renderOption: SelectProps['renderOption'] = ({ option }) => {
      const a = areas.find((x) => String(x.id) === option.value)
      return (
        <div className="flex w-full items-center justify-between gap-3">
          <span>{a?.name}</span>
          {a && (
            <span className="rounded-(--pub-radius-pill) bg-(--pub-primary-soft) px-2 py-0.5 text-(length:--pub-text-sm) font-semibold whitespace-nowrap">
              {verb} {feeOf(a)}
            </span>
          )}
        </div>
      )
    }
    const addressKey = isPickup ? 'pickupAddress' : 'deliveryAddress'
    return (
      <Input.Wrapper label="Địa chỉ" required labelElement="div">
        <Stack gap={8} mt={4}>
          <Select
            aria-label={isPickup ? 'Khu vực lấy đồ' : 'Khu vực giao đồ'}
            aria-required
            placeholder="Chọn khu vực"
            data={areas.map((a) => ({ value: String(a.id), label: `${a.name} · ${verb} ${feeOf(a)}` }))}
            renderOption={renderOption}
            {...form.getInputProps(key)}
            value={current ? String(current.id) : null}
            onChange={(v) => {
              const id = v ? Number(v) : null
              form.setFieldValue(key, id)
              if (isPickup && delivery && deliveryAreaId === null) form.setFieldValue('deliveryAreaId', id)
            }}
          />
          <TextInput
            aria-label={isPickup ? 'Địa chỉ lấy đồ' : 'Địa chỉ giao đồ'}
            aria-required
            placeholder="Số nhà, tên đường…"
            maxLength={255}
            {...form.getInputProps(addressKey)}
          />
          {showHint && (
            <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
              Địa chỉ không thuộc khu vực nào? Anh/chị vui lòng chọn Mang đến tiệm / Nhận tại tiệm
              {storePhone ? ` hoặc gọi tiệm ${storePhone}` : ''}.
            </p>
          )}
        </Stack>
      </Input.Wrapper>
    )
  }

  return (
    <Stack gap="lg">
      {!doorEnabled && (
        <Alert color="gray" role="status">
          Tiệm hiện chưa nhận lấy và giao tận nơi
        </Alert>
      )}
      <Section title="Gửi đồ">
        <Radio.Group label="Hình thức gửi đồ" {...form.getInputProps('dropoffMethod')}>
          <div className={GROUP}>
            <Choice
              value="AT_STORE"
              title="Mang đến tiệm"
              desc={[storeAddress, `giờ mở cửa ${store.openingTime} – ${store.closingTime}`]
                .filter(Boolean)
                .join(' · ')}
            />
            {doorEnabled && (
              <Choice
                value="PICKUP"
                title="Lấy tận nơi"
                desc="Tiệm đến lấy đồ tại địa chỉ của anh/chị"
              />
            )}
          </div>
        </Radio.Group>
        {doorEnabled && pickup && addressGroup('pickup', true)}
      </Section>
      <Section title="Nhận đồ">
        <Radio.Group
          label="Hình thức nhận lại"
          {...form.getInputProps('returnMethod')}
          onChange={onReturn}
        >
          <div className={GROUP}>
            <Choice
              value="AT_STORE"
              title="Nhận tại tiệm"
              desc={`Đến tiệm nhận đồ khi đơn Hoàn thành · giờ mở cửa ${store.openingTime} – ${store.closingTime}`}
            />
            {doorEnabled && (
              <Choice
                value="DELIVERY"
                title="Giao tận nơi"
                desc="Tiệm giao đồ đến địa chỉ của anh/chị"
              />
            )}
          </div>
        </Radio.Group>
        {doorEnabled && delivery && addressGroup('delivery', !pickup)}
      </Section>
    </Stack>
  )
}
