import { useNavigate, useSearchParams } from 'react-router-dom'
import { IntakeForm, type IntakeResult } from '@/features/orders'
import { PageHeader } from '@/shared/ui'
import { PATHS } from '@/shared/config/paths'

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
