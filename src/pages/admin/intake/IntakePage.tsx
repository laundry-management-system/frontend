import { useNavigate, useSearchParams } from 'react-router-dom'
import { IntakeForm, type IntakeResult } from '@/features/admin/orders'
import { PageHeader } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

export default function IntakePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const openDone = ({ orders }: IntakeResult) =>
    navigate(PATHS.intakeDone(orders[0].id), { replace: true, state: { autoPrint: true } })

  return (
    <>
      <PageHeader title="Tiếp nhận đồ" />
      <IntakeForm initialPhone={params.get('phone') ?? ''} onCreated={openDone} />
    </>
  )
}
