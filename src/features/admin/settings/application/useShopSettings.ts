import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../data/settingsApi'
import type { Setting, ShopSettings } from '../domain/types'
import { settingKeys } from './queryKeys'

const valueOf = (list: Setting[], key: Setting['key'], fallback: number) =>
  Number(list.find((s) => s.key === key)?.value ?? fallback)

const toShopSettings = (list: Setting[]): ShopSettings => ({
  whitesFee: valueOf(list, 'WHITES_FEE', 0),
  compensationMultiplier: valueOf(list, 'COMPENSATION_MULTIPLIER', 10),
  compensationCap: valueOf(list, 'COMPENSATION_CAP_PER_ITEM', 500000),
})

/** Cùng cache với useSettings: tạo đơn và màn Cài đặt chỉ tải danh sách tham số một lần */
export function useShopSettings() {
  return useQuery({
    queryKey: settingKeys.all,
    queryFn: settingsApi.list,
    staleTime: 5 * 60_000,
    select: toShopSettings,
  })
}
