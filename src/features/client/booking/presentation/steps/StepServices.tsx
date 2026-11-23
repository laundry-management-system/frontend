import { Checkbox, Input, Radio } from '@mantine/core'
import { useId } from 'react'
import { LuCheck, LuZap } from 'react-icons/lu'
import { UNIT_LABEL, type PublicService } from '@/features/client/public-site'
import { EmptyState } from '@/shared/client/ui'
import { formatMoney } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { useBookingFormContext } from '../../application/bookingForm'
import { gapHoursOf, hasWhitesService, itemsForTier, TIER_LABEL } from '../../domain/draft'
import type { BookingSettings, OrderType } from '../../domain/types'

interface StepServicesProps {
  services: readonly PublicService[]
  settings: BookingSettings
}

const ROW = 'flex min-h-[3.75rem] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-2'
const TIERS: OrderType[] = ['NORMAL', 'EXPRESS']

/** Bước 1: chọn một hình thức giặt, rồi chọn nhiều dịch vụ của hình thức đó; thứ tự dòng = thứ tự chọn. */
export function StepServices({ services, settings }: StepServicesProps) {
  const form = useBookingFormContext()
  const servicesId = useId()
  const { items, orderType } = form.values
  const express = orderType === 'EXPRESS'
  const expressServices = services.filter((s) => s.expressSupported)
  const shown = express ? expressServices : services

  const changeTier = (value: string) => {
    const tier = value as OrderType
    const kept = itemsForTier(
      items,
      tier,
      expressServices.map((s) => s.id),
    )
    // Bỏ sẵn ở đây để hiện số dịch vụ bị bỏ; effect prune trong bookingForm khi đó không còn gì để bỏ.
    form.setValues({ orderType: tier, items: kept })
    const dropped = items.length - kept.length
    if (dropped > 0) notify.warning(`Đã bỏ ${dropped} dịch vụ không hỗ trợ giặt nhanh`)
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
      <Radio.Group label="Hình thức giặt" value={orderType} onChange={changeTier}>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          {TIERS.map((t) => (
            <Radio.Card key={t} value={t} className="bk-check bk-choice">
              <Radio.Indicator icon={LuCheck} mt={2} />
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                <span className="bk-caps">{TIER_LABEL[t]}</span>
                <span className="text-(length:--pub-text-sm) font-semibold text-(--pub-primary)">
                  {gapHoursOf(settings, t)} giờ
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
          <EmptyState icon={<LuZap size={32} />} title="Chưa có dịch vụ hỗ trợ giặt nhanh" />
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
                      <span className="bk-price">
                        {formatMoney(s.price + (express ? (s.expressSurcharge ?? 0) : 0))}
                      </span>
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
          <div className={ROW}>
            <Checkbox
              {...form.getInputProps('washWhitesSeparately', { type: 'checkbox' })}
              size="md"
              classNames={{ root: 'flex min-h-11 w-full items-center', label: 'bk-name' }}
              label="Giặt riêng đồ trắng"
            />
          </div>
        </div>
      )}
    </div>
  )
}
