import { Button, Card, Center, Loader } from '@mantine/core'
import { LuCloudOff, LuPackageOpen, LuPackageX } from 'react-icons/lu'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ClassifyEditor, isUnclassified, useOrder } from '@/features/orders'
import { toApiError } from '@/shared/api/apiError'
import { EmptyState, PageHeader } from '@/shared/ui'

export default function ClassifyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const selectedId = Number(params.get('order')) || null
  const { data: order, isLoading, error, refetch } = useOrder(selectedId)
  const editable = !!order && isUnclassified({ ...order, totalItemsCount: order.items.length })

  const handleRetry = () => refetch()
  const openDetail = () => order && navigate(`/orders/${order.id}`, { replace: true })

  const toOrders = (
    <Button variant="secondary" component={Link} to="/orders?status=RECEIVED">
      Xem đơn Mới nhận
    </Button>
  )

  let main
  if (!selectedId)
    main = (
      <EmptyState
        icon={<LuPackageOpen size={32} />}
        title="Chưa chọn đơn để phân loại"
        description="Mở đơn từ danh sách đơn hàng hoặc bấm Phân loại ngay sau khi tạo đơn."
        action={toOrders}
      />
    )
  else if (isLoading)
    main = (
      <Center py="xl">
        <Loader />
      </Center>
    )
  else if (!order) {
    const loadFailed = !!error && toApiError(error).status !== 404
    main = (
      <EmptyState
        icon={loadFailed ? <LuCloudOff size={32} /> : <LuPackageX size={32} />}
        title={loadFailed ? 'Không tải được đơn' : 'Không tìm thấy đơn'}
        description={
          loadFailed
            ? 'Vui lòng kiểm tra kết nối rồi thử lại.'
            : 'Đơn này không tồn tại hoặc đường dẫn không đúng.'
        }
        action={
          loadFailed ? (
            <Button variant="secondary" onClick={handleRetry}>
              Thử lại
            </Button>
          ) : (
            toOrders
          )
        }
      />
    )
  } else if (!editable)
    main = (
      <EmptyState
        icon={<LuPackageX size={32} />}
        title="Đơn đã được phân loại"
        description="Đơn này không còn ở trạng thái chờ phân loại."
        action={
          <Button variant="secondary" component={Link} to={`/orders/${order.id}`}>
            Xem chi tiết đơn
          </Button>
        }
      />
    )

  return (
    <>
      <PageHeader title="Phân loại đồ" description="Đơn đã tiếp nhận nhanh, chưa có chi tiết đồ" />
      {editable ? (
        <ClassifyEditor key={order.id} order={order} onSaved={openDetail} />
      ) : (
        <Card>{main}</Card>
      )}
    </>
  )
}
