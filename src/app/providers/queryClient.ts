import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'

// 403: BE từ chối thao tác nhưng phiên vẫn còn – chỉ báo, không đăng xuất
const onError = (error: Error) => {
  if ((error as ApiError).status === 403) notify.error('Không có quyền thực hiện thao tác này')
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError }),
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
})
