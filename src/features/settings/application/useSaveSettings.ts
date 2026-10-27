import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toApiError } from '@/shared/api/apiError'
import { settingsApi } from '../data/settingsApi'
import type { Setting } from '../domain/types'
import { settingKeys } from './queryKeys'

export interface SettingChange {
  key: string
  value: string
}

export interface SaveSettingsResult {
  saved: Setting[]
  failed: { key: string; message: string }[]
}

// BE chỉ có API sửa từng key: gửi song song, ô nào lỗi thì báo riêng ô đó
async function saveAll(changes: SettingChange[]): Promise<SaveSettingsResult> {
  const results = await Promise.allSettled(
    changes.map((c) => settingsApi.update(c.key, c.value.trim())),
  )
  const saved: Setting[] = []
  const failed: SaveSettingsResult['failed'] = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') saved.push(r.value)
    else failed.push({ key: changes[i].key, message: toApiError(r.reason).message })
  })
  return { saved, failed }
}

export function useSaveSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveAll,
    onSettled: () => queryClient.invalidateQueries({ queryKey: settingKeys.all }),
  })
}
