import { Alert, Button, Group, Text } from '@mantine/core'
import { useState } from 'react'
import { LuTriangleAlert } from 'react-icons/lu'
import { useCurrentShift } from '../application/queries/useCurrentShift'
import { OpenShiftModal } from './OpenShiftModal'

// Vạch màu đậm bên trái để cảnh báo nổi hơn các Alert thông tin khác trên trang
const ALERT_STYLES = {
  root: { borderLeft: '4px solid var(--tone-warning-solid)' },
  icon: { color: 'var(--tone-warning-solid)' },
}

// Nền cam đậm (amber-700) để chữ trắng đạt tương phản ~5:1; amber-600 trở xuống thì chữ trắng không đủ đọc
const BUTTON_VARS = () => ({
  root: {
    '--button-bg': 'var(--color-amber-700)',
    '--button-hover': 'var(--color-amber-800)',
    '--button-color': 'var(--color-white)',
  },
})
// Không co nút khi khung hẹp (VD trong modal thanh toán), để chữ không bị cắt
const BUTTON_STYLES = { root: { flexShrink: 0 }, label: { fontWeight: 700 } }

interface NoShiftBannerProps {
  staffName: string
  /**
   * Hiện nút Mở ca ngay trong cảnh báo. Tắt ở trang có header (nút Mở ca đã nằm trên header);
   * giữ trong modal thanh toán vì modal che mất header.
   */
  withAction?: boolean
}

/** Cảnh báo khi cửa hàng chưa có ca đang mở: chưa mở ca thì chưa xác nhận thanh toán được. */
export function NoShiftBanner({ staffName, withAction = true }: NoShiftBannerProps) {
  const { data } = useCurrentShift()
  const [opened, setOpened] = useState(false)

  if (!data || data.current) return null

  const openModal = () => setOpened(true)
  const closeModal = () => setOpened(false)

  return (
    <>
      <Alert
        color="warning"
        variant="light"
        icon={<LuTriangleAlert size={20} />}
        styles={ALERT_STYLES}
        mb="md"
        role="alert"
      >
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text size="sm" fw={700}>
              Chưa mở ca – chưa xác nhận thanh toán được
            </Text>
            <Text size="sm">
              {withAction
                ? 'Mở ca trước khi thu tiền để mọi giao dịch được gắn vào ca.'
                : 'Bấm Mở ca ở góc trên bên phải trước khi thu tiền.'}
            </Text>
          </div>
          {withAction && (
            <Button color="warning" vars={BUTTON_VARS} styles={BUTTON_STYLES} onClick={openModal}>
              Mở ca ngay
            </Button>
          )}
        </Group>
      </Alert>
      <OpenShiftModal opened={opened} onClose={closeModal} staffName={staffName} />
    </>
  )
}
