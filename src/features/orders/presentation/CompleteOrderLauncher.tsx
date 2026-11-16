import { Button, Center, Loader, Modal } from '@mantine/core'
import { LuCloudOff } from 'react-icons/lu'
import { EmptyState } from '@/shared/ui'
import { useOrder } from '../application/queries/useOrder'
import { CompleteOrderModal } from './modals/CompleteOrderModal'

interface CompleteOrderLauncherProps {
  orderId: number
  onClose: () => void
}

const noop = () => {}

/** Mở modal Hoàn thành từ một dòng danh sách: modal cần chi tiết đơn nên tải trước. */
export function CompleteOrderLauncher({ orderId, onClose }: CompleteOrderLauncherProps) {
  const { data, isError, refetch } = useOrder(orderId)
  const handleRetry = () => refetch()

  if (data) return <CompleteOrderModal order={data} onClose={onClose} onNotified={noop} />

  return (
    <Modal opened onClose={onClose} title="Hoàn thành đơn" centered>
      {isError ? (
        <EmptyState
          icon={<LuCloudOff size={32} />}
          title="Không tải được đơn"
          description="Vui lòng kiểm tra kết nối rồi thử lại."
          action={<Button onClick={handleRetry}>Thử lại</Button>}
        />
      ) : (
        <Center py="xl">
          <Loader />
        </Center>
      )}
    </Modal>
  )
}
