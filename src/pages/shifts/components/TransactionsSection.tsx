import { Box, Button, Card, Collapse } from '@mantine/core'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'
import { ShiftTransactionsTable } from '@/features/shifts'
import { useShiftReconcileContext } from '../ShiftReconcileContext'
import { TOGGLE_VARS } from './toggleVars'

/** Giao dịch trong ca, thu gọn được; bước 2 mở và cuộn tới đây khi chuyển khoản lệch */
export function TransactionsSection() {
  const { shift, txnsOpen, txnsRef, toggleTxns } = useShiftReconcileContext()
  return (
    // Bảng nhiều cột: trải hết chiều ngang, nằm dưới cả hai cột
    <Box mt="lg" ref={txnsRef}>
      <Card>
        <Button
          variant="subtle"
          vars={TOGGLE_VARS}
          leftSection={txnsOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
          onClick={toggleTxns}
        >
          {txnsOpen ? 'Ẩn giao dịch trong ca' : 'Xem giao dịch trong ca'}
        </Button>
        <Collapse expanded={txnsOpen}>
          <Box pt="sm">{txnsOpen && <ShiftTransactionsTable shiftId={shift.id} />}</Box>
        </Collapse>
      </Card>
    </Box>
  )
}
