import { Checkbox, Input, Radio } from '@mantine/core'
import { useId } from 'react'
import { LuCheck, LuZap } from 'react-icons/lu'
import { UNIT_LABEL, type PublicService, usePublicStore } from '@/features/client/public-site'
import { EmptyState } from '@/shared/client/ui'
import { formatMoney } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { useBookingFormContext } from '../../application/bookingForm'
import { hasWhitesService, priceOf } from '../../domain/draft'
import type { BookingWashMode } from '../../domain/types'

interface StepServicesProps {
  services: readonly PublicService[]
  modes: readonly BookingWashMode[]
}

// Mantine mặc định căn đầu ô tích lên trên; căn giữa để hàng cân đối
const WHITES_CHECKBOX_STYLES = { body: { alignItems: 'center' } } as const

/** Bước 1: chọn một hình thức giặt (từ API), rồi chọn nhiều dịch vụ có giá ở hình thức đó; thứ tự dòng = thứ tự chọn. */
export function StepServices({ services, modes }: StepServicesProps) {
  const form = useBookingFormContext()
  const servicesId = useId()
  const { items, washModeId } = form.values
  const whitesFee = usePublicStore().data?.whitesFee
  const shown = services.filter((s) => priceOf(s, washModeId) !== null)

  const changeMode = (value: string) => {
    const id = Number(value)
    const kept = items.filter((i) => {
      const s = services.find((x) => x.id === i.serviceId)
      return s && priceOf(s, id) !== null
    })
    // Bỏ sẵn ở đây để hiện số dịch vụ bị bỏ; effect prune trong bookingForm khi đó không còn gì để bỏ.
    form.setValues({ washModeId: id, items: kept })
    const dropped = items.length - kept.length
    if (dropped > 0) notify.warning(`Đã bỏ ${dropped} dịch vụ không áp dụng cho hình thức này`)
  }

  const toggle = (id: number, checked: boolean) => {
    const index = items.findIndex((i) => i.serviceId === id)
    if (checked && index < 0) form.insertListItem('items', { serviceId: id })
    if (!checked && index >= 0) {
      form.removeListItem('items', index)
      // Bỏ dịch vụ áp dụng cuối cùng: hạ cờ ngay để ô hiện lại không còn tích.
      if (
        !hasWhitesService(
          items.filter((_, i) => i !== index),
          services,
        )
      )
        form.setFieldValue('washWhitesSeparately', false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Radio.Group
        label="Hình thức giặt"
        value={washModeId === null ? null : String(washModeId)}
        onChange={changeMode}
      >
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          {modes.map((m) => (
            <Radio.Card key={m.id} value={String(m.id)} className="bk-check bk-choice">
              <Radio.Indicator icon={LuCheck} mt={2} />
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                <span className="bk-caps">{m.name}</span>
                <span className="text-(length:--pub-text-sm) font-semibold text-(--pub-primary)">
                  {m.completionHours} giờ
                </span>
              </span>
            </Radio.Card>
          ))}
        </div>
      </Radio.Group>
      <Input.Wrapper
        id={servicesId}
        label="Dịch vụ"
        role="group"
        aria-labelledby={`${servicesId}-label`}
      >
        {shown.length === 0 ? (
          <EmptyState
            icon={<LuZap size={32} />}
            title="Chưa có dịch vụ cho hình thức này"
            description="Vui lòng chọn hình thức khác."
          />
        ) : (
          <ul className="mt-1 grid gap-3 sm:grid-cols-2">
            {shown.map((s) => {
              const on = items.some((i) => i.serviceId === s.id)
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s.id, !on)}
                    className="bk-option h-full"
                  >
                    <span className="bk-name">{s.name}</span>
                    <span className="mt-auto flex items-baseline gap-1">
                      <span className="bk-price">{formatMoney(priceOf(s, washModeId) ?? 0)}</span>
                      <span className="bk-unit">/{UNIT_LABEL[s.unit]}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Input.Wrapper>
      {hasWhitesService(items, services) && (
        <div className="bk-panel p-0">
          <div className="px-5">
            <Checkbox
              {...form.getInputProps('washWhitesSeparately', { type: 'checkbox' })}
              size="md"
              classNames={{
                root: 'w-full',
                body: 'w-full',
                labelWrapper: 'flex-1',
                label: 'bk-name block w-full cursor-pointer py-4',
              }}
              styles={WHITES_CHECKBOX_STYLES}
              label={
                <span className="flex items-center justify-between gap-x-4">
                  <span>Giặt riêng đồ trắng</span>
                  {!!whitesFee && (
                    <span className="whitespace-nowrap tabular-nums">
                      <span className="font-semibold text-(--pub-primary)">
                        +{formatMoney(whitesFee)}
                      </span>
                      <span className="bk-unit">/đơn</span>
                    </span>
                  )}
                </span>
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
