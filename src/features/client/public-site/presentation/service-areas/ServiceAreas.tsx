import { Skeleton } from '@mantine/core'
import { LuStore } from 'react-icons/lu'
import { usePublicServiceAreas } from '../../application/queries/usePublicServiceAreas'
import { SectionError } from '../SectionError'
import { SectionHeading } from '../SectionHeading'
import { AreaList } from './AreaList'
import { StoreContact } from './StoreContact'
import { StorePanel } from './StorePanel'

const TITLE_ID = 'khu-vuc-title'
const SKELETON_ROWS = [0, 1, 2, 3]

function ServiceAreasSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-hidden="true">
      <Skeleton h={360} radius="md" />
      <div className="pub-card flex flex-col gap-5 p-6">
        {SKELETON_ROWS.map((i) => (
          <Skeleton key={i} h={20} w={`${80 - i * 10}%`} />
        ))}
      </div>
    </div>
  )
}

/** Khu vực lấy, giao tận nơi đang phục vụ, theo thứ tự tiệm thêm vào. */
export function ServiceAreas() {
  const areas = usePublicServiceAreas()
  const handleRetry = () => areas.refetch()

  let body
  if (areas.isPending) body = <ServiceAreasSkeleton />
  else if (areas.isError) body = <SectionError what="khu vực phục vụ" onRetry={handleRetry} />
  else if (areas.data.length === 0)
    body = (
      <div className="pub-card flex flex-col gap-3 p-6">
        <p className="flex items-start gap-3 font-semibold">
          <span className="pub-icon-tile" aria-hidden="true">
            <LuStore size={24} />
          </span>
          <span className="self-center">Hiện tiệm chỉ nhận và trả đồ tại tiệm.</span>
        </p>
        <StoreContact />
      </div>
    )
  else
    body = (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <StorePanel areas={areas.data} />
        <AreaList areas={areas.data} />
      </div>
    )

  return (
    <section
      id="khu-vuc"
      aria-labelledby={TITLE_ID}
      aria-busy={areas.isPending}
      className="pub-section"
    >
      <div className="pub-container">
        <SectionHeading id={TITLE_ID} eyebrow="Giao nhận" title="Khu vực phục vụ">
          {areas.data?.length
            ? 'Tiệm lấy đồ và giao trả tận nơi trong các khu vực dưới đây.'
            : null}
        </SectionHeading>
        {body}
      </div>
    </section>
  )
}
