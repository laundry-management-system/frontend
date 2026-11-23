import { Button, Card, Flex, Skeleton, Stack } from '@mantine/core'
import { LuCloudOff } from 'react-icons/lu'
import { SettingsForm, useSettings } from '@/features/admin/settings'
import { EmptyState, PageHeader } from '@/shared/admin/ui'

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSettings()
  const handleRetry = () => refetch()

  const body = data ? (
    <SettingsForm settings={data} />
  ) : isError ? (
    <Card>
      <EmptyState
        icon={<LuCloudOff size={32} />}
        title="Không tải được cài đặt"
        description="Vui lòng kiểm tra kết nối rồi thử lại."
        action={<Button onClick={handleRetry}>Thử lại</Button>}
      />
    </Card>
  ) : (
    isLoading && (
      <Flex direction={{ base: 'column', md: 'row' }} gap="lg">
        <Stack gap="lg" flex={1}>
          <Skeleton h={360} />
          <Skeleton h={200} />
        </Stack>
        <Stack gap="lg" flex={1} w="100%">
          <Skeleton h={300} />
          <Skeleton h={200} />
        </Stack>
      </Flex>
    )
  )

  return (
    <>
      {!data && <PageHeader title="Cài đặt cửa hàng" description="Áp dụng cho toàn hệ thống" />}
      {body}
    </>
  )
}
