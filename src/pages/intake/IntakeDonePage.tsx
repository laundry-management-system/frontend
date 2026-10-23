import { Button, Center, Loader } from '@mantine/core'
import { useEffect, useRef } from 'react'
import { LuCloudOff, LuPackageX } from 'react-icons/lu'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  OrderCreatedCard,
  ReceiptPrintArea,
  useIntakeOrders,
  useOrder,
  usePrintReceipt,
} from '@/features/orders'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { EmptyState } from '@/shared/ui'

export default function IntakeDonePage() {
  const id = Number(useParams().orderId)
  const navigate = useNavigate()
  const location = useLocation()
  const { data: order, isLoading, error, refetch } = useOrder(id)
  const intake = useIntakeOrders(order?.intakeCode)
  const { receipts, print, isPrinting } = usePrintReceipt()
  const autoPrinted = useRef(false)

  // Lượt 2 đơn: in cả hai, đơn tiêu chuẩn trước
  // Tải lượt lỗi thì vẫn hiện/in đơn đang mở
  const orders = order ? (order.intakeCode && intake.data?.length ? intake.data : [order]) : []
  const ready = !!order && (!order.intakeCode || !intake.isLoading)
  const orderIds = orders.map((o) => o.id).join(',')

  const printAll = () =>
    print(orders.map((o) => o.id)).catch((e) =>
      notify.error(toApiError(e).message, 'Chưa in được phiếu'),
    )

  // Vừa tạo lượt ở WF-C01 → in ngay một lần; F5 không in lại
  useEffect(() => {
    if (
      !ready ||
      !(location.state as { autoPrint?: boolean } | null)?.autoPrint ||
      autoPrinted.current
    )
      return
    autoPrinted.current = true
    navigate('.', { replace: true, state: null })
    print(orderIds.split(',').map(Number)).catch((e) =>
      notify.error(toApiError(e).message, 'Chưa in được phiếu – bấm In lại'),
    )
  }, [ready, orderIds, location.state, navigate, print])

  const handleRetry = () => refetch()
  const goIntake = () => navigate('/intake')

  if (isLoading || (order?.intakeCode && intake.isLoading))
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    )

  if (!order) {
    const loadFailed = !!error && toApiError(error).status !== 404
    return (
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
            <Button variant="secondary" component={Link} to="/intake">
              Về tiếp nhận đồ
            </Button>
          )
        }
      />
    )
  }

  const openClassify = (orderId: number) => navigate(`/classify?order=${orderId}`)

  return (
    <>
      <OrderCreatedCard
        customerName={order.customerName}
        customerPhone={order.customerPhone}
        intakeCode={order.intakeCode}
        orders={orders}
        onNext={goIntake}
        onPrintAll={printAll}
        onClassify={openClassify}
        printing={isPrinting}
      />
      <ReceiptPrintArea receipts={receipts} />
    </>
  )
}
