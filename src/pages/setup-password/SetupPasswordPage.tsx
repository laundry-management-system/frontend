import { useSearchParams } from 'react-router-dom'
import { SetupPasswordCard } from '@/features/auth'

// Link trong email kích hoạt: <origin>/setup-password?token=…
export default function SetupPasswordPage() {
  const [params] = useSearchParams()
  return <SetupPasswordCard token={params.get('token')} />
}
