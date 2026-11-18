import { formatPhone } from '@/shared/common/lib/format'
import { LuPhone, LuStore } from 'react-icons/lu'
import { usePublicStore } from '../../application/queries/usePublicStore'

/** Địa chỉ và số gọi của tiệm, phần nào chưa nhập thì bỏ. */
export function StoreContact() {
  const { data } = usePublicStore()
  const address = data?.address ?? null
  const phone = data?.phone ?? null
  if (!address && !phone) return null
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6">
      {address && (
        <p className="flex items-start gap-2">
          <LuStore size={18} className="mt-1 flex-none" aria-hidden="true" />
          <span>{address}</span>
        </p>
      )}
      {phone && (
        <a href={`tel:${phone}`} className="pub-link">
          <LuPhone size={18} aria-hidden="true" />
          {formatPhone(phone)}
        </a>
      )}
    </div>
  )
}
