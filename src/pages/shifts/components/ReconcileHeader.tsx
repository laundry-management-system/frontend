import { Alert, Button, Group, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { useState } from 'react'
import { LuCircleCheck, LuInfo, LuPrinter } from 'react-icons/lu'
import { ShiftSlipPrintArea, usePrintShiftSlip } from '@/features/shifts'
import { EntityCode, PageHeader } from '@/shared/ui'
import { useShiftReconcileContext } from '../ShiftReconcileContext'
import { ApproveShiftModal } from './ApproveShiftModal'
import { ShiftBreadcrumbs, ShiftDescription, ShiftTitle } from './ShiftHeading'

const PAGE_INFO =
  'Làm lần lượt 3 bước: đếm tiền mặt, đối chiếu chuyển khoản, bàn giao. Kết ca xong in phiếu, ký và kẹp cùng tiền nộp chủ tiệm.'

const dateTime = (iso: string | null) => (iso ? dayjs(iso).format('DD/MM HH:mm') : '')

/** Đầu trang: kết ca hiện tiêu đề + hướng dẫn; duyệt ca hiện trạng thái, nút In lại / Duyệt ca */
export function ReconcileHeader() {
  const { editable, shift, onBehalf } = useShiftReconcileContext()
  const { slip, print } = usePrintShiftSlip()
  const [approving, setApproving] = useState(false)

  const reprint = () => print(shift)
  const openApprove = () => setApproving(true)
  const closeApprove = () => setApproving(false)

  if (editable) {
    // PageHeader bọc description trong <p>: chỉ dùng phần tử inline
    const description = (
      <>
        <EntityCode code={shift.code} /> · {shift.openedByName} · mở {dateTime(shift.openedAt)}
      </>
    )
    return (
      <PageHeader
        title={onBehalf ? 'Kết ca thay' : 'Kết ca'}
        description={description}
        info={PAGE_INFO}
      />
    )
  }

  const actions = (
    <Group gap="sm">
      <Button variant="secondary" leftSection={<LuPrinter size={16} />} onClick={reprint}>
        In lại phiếu
      </Button>
      {shift.status === 'CLOSED' && (
        <Button leftSection={<LuCircleCheck size={16} />} onClick={openApprove}>
          Duyệt ca
        </Button>
      )}
    </Group>
  )

  return (
    <>
      <ShiftBreadcrumbs code={shift.code} />
      <PageHeader
        title={<ShiftTitle shift={shift} />}
        description={<ShiftDescription shift={shift} />}
        actions={actions}
      />
      {shift.status === 'APPROVED' && (
        <Alert color="success" variant="light" icon={<LuCircleCheck size={18} />} mb="md">
          <Text size="sm">
            <b>Đã duyệt</b> bởi {shift.approvedByName} lúc {dateTime(shift.approvedAt)}
            {shift.approvalNote && ` · ${shift.approvalNote}`}
          </Text>
        </Alert>
      )}
      {onBehalf && (
        <Alert color="info" variant="light" icon={<LuInfo size={18} />} mb="md">
          <Text size="sm">
            <b>Admin kết ca thay:</b> {shift.closeOnBehalfReason}
          </Text>
        </Alert>
      )}
      <ApproveShiftModal
        opened={approving}
        onClose={closeApprove}
        shiftId={shift.id}
        code={shift.code}
      />
      <ShiftSlipPrintArea shift={slip} />
    </>
  )
}
