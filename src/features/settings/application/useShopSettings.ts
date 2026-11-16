import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../data/settingsApi'
import type { Setting, ShopSettings } from '../domain/types'
import { settingKeys } from './queryKeys'

const toShopSettings = (list: Setting[]): ShopSettings => ({
  whitesFee: Number(list.find((s) => s.key === 'WHITES_FEE')?.value ?? 0),
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
