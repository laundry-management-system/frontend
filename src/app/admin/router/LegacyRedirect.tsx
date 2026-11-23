import { Navigate, useLocation, useParams } from 'react-router-dom'

/** Chuyển URL cũ sang URL mới, giữ query cũ (khóa của URL đích được ưu tiên, VD `tab`). */
export function LegacyRedirect({
  to,
}: {
  to: (params: Record<string, string | undefined>, query: URLSearchParams) => string
}) {
  const params = useParams()
  const { search } = useLocation()
  const query = new URLSearchParams(search)
  const [path, targetQuery = ''] = to(params, query).split('?')
  new URLSearchParams(targetQuery).forEach((value, key) => query.set(key, value))
  const qs = query.toString()
  return <Navigate to={qs ? `${path}?${qs}` : path} replace />
}
