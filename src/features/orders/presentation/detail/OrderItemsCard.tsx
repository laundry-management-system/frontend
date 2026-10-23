import {
  Badge,
  Button,
  Card,
  Group,
  Image,
  Modal,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useState } from 'react'
import { LuChevronLeft, LuChevronRight, LuPackageOpen } from 'react-icons/lu'
import { UNIT_LABEL, useActiveServices } from '@/features/services'
import { EmptyState, IconButton, Money } from '@/shared/ui'
import type { OrderImage, OrderLine, RequestedService } from '../../domain/types'

const THUMB = {
  borderRadius: 'var(--radius-control)',
  border: '1px solid var(--ds-border)',
  overflow: 'hidden',
}

const fmt = (n: number, line: OrderLine) => `${n.toLocaleString('vi-VN')} ${UNIT_LABEL[line.unit]}`
// Đơn v3: KL tính tiền có thể lớn hơn KL thực tế (theo tối thiểu)
const billed = (line: OrderLine) => line.billableQuantity ?? Number(line.quantity)
const qty = (line: OrderLine) =>
  billed(line) > Number(line.quantity)
    ? `${fmt(Number(line.quantity), line)} → tính ${fmt(billed(line), line)}`
    : fmt(Number(line.quantity), line)

const hasCondition = (l: OrderLine) =>
  l.conditionTags.length > 0 || !!l.conditionText || (l.images?.length ?? 0) > 0

export function OrderItemsCard({
  items,
  requestedServices = [],
  onClassify,
}: {
  items: OrderLine[]
  /** Dịch vụ chọn ở quầy (tham khảo), hiện khi chưa phân loại */
  requestedServices?: RequestedService[]
  onClassify?: () => void
}) {
  // shortcut: tên dịch vụ lấy từ danh sách đang hoạt động; dịch vụ đã ngừng hiện "—" (BE không trả tên trong dòng đồ)
  const { data: services = [] } = useActiveServices()
  const [preview, setPreview] = useState<{ images: OrderImage[]; index: number } | null>(null)
  const closePreview = () => setPreview(null)
  // Xoay vòng khi đi quá ảnh đầu / cuối
  const step = (delta: number) =>
    setPreview((p) => p && { ...p, index: (p.index + delta + p.images.length) % p.images.length })
  const showPrev = () => step(-1)
  const showNext = () => step(1)

  if (!items.length)
    return (
      <Card>
        <Title order={5} mb="sm">
          Chi tiết đồ giặt
        </Title>
        {requestedServices.length > 0 && (
          <Group gap={6} mb="sm">
            <Text size="sm" c="dimmed">
              Dịch vụ tham khảo:
            </Text>
            {requestedServices.map((r) => (
              <Badge key={r.id} color="gray" variant="light" radius="sm" tt="none">
                {r.name ?? `#${r.id}`}
              </Badge>
            ))}
          </Group>
        )}
        <EmptyState
          icon={<LuPackageOpen size={32} />}
          title="Chưa phân loại"
          description="Khối lượng, dịch vụ và giá sẽ hiện ở đây sau khi phân loại."
          action={onClassify && <Button onClick={onClassify}>Phân loại ngay</Button>}
        />
      </Card>
    )

  const itemTable = (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={30}>#</Table.Th>
          <Table.Th>Loại đồ</Table.Th>
          <Table.Th w={170}>Dịch vụ</Table.Th>
          <Table.Th w={90} ta="right">
            SL/KL
          </Table.Th>
          <Table.Th w={100} ta="right">
            Đơn giá
          </Table.Th>
          <Table.Th w={110} ta="right">
            Thành tiền
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((l, i) => (
          <Table.Tr key={l.id ?? i}>
            <Table.Td>{i + 1}</Table.Td>
            <Table.Td>{l.itemType}</Table.Td>
            <Table.Td>{services.find((s) => s.id === l.serviceId)?.name ?? '—'}</Table.Td>
            <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
              {qty(l)}
            </Table.Td>
            <Table.Td ta="right">
              <Money value={l.unitPrice} />
            </Table.Td>
            <Table.Td ta="right">
              <Money value={Math.round(l.unitPrice * billed(l))} />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )

  const conditionNotes = items.map((l, i) =>
    hasCondition(l) ? (
      <Stack
        key={l.id ?? i}
        gap="sm"
        p="md"
        bg="var(--ds-muted)"
        style={{ borderRadius: 'var(--radius-control)' }}
      >
        <Text fw={600}>{`Tình trạng ban đầu · ${l.itemType}`}</Text>
        {l.conditionTags.length > 0 && (
          <Group gap={6}>
            {l.conditionTags.map((tag) => (
              <Badge key={tag} color="warning" variant="light" tt="none">
                {tag}
              </Badge>
            ))}
          </Group>
        )}
        {l.conditionText && (
          <Text size="sm" c="dimmed">
            {`“${l.conditionText}”`}
          </Text>
        )}
        {!!l.images?.length && (
          <Group gap="sm">
            {l.images.map((img, k) => (
              <UnstyledButton
                key={img.id}
                onClick={() => setPreview({ images: l.images!, index: k })}
                aria-label={`Xem ảnh ${k + 1} lớn`}
                style={THUMB}
              >
                <Image
                  src={img.imageUrl}
                  w={72}
                  h={72}
                  fit="cover"
                  alt={img.note ?? 'Ảnh tình trạng'}
                />
              </UnstyledButton>
            ))}
          </Group>
        )}
      </Stack>
    ) : null,
  )

  const imagePreview = (
    <Modal
      opened={!!preview}
      onClose={closePreview}
      size="lg"
      title={
        preview && preview.images.length > 1
          ? `Ảnh tình trạng ${preview.index + 1}/${preview.images.length}`
          : 'Ảnh tình trạng'
      }
    >
      {preview && (
        <Stack gap="sm">
          <Image src={preview.images[preview.index].imageUrl} alt="Ảnh tình trạng" radius="sm" />
          {preview.images.length > 1 && (
            <Group justify="space-between">
              <IconButton label="Ảnh trước" icon={<LuChevronLeft size={18} />} onClick={showPrev} />
              <IconButton label="Ảnh sau" icon={<LuChevronRight size={18} />} onClick={showNext} />
            </Group>
          )}
        </Stack>
      )}
    </Modal>
  )

  return (
    <Card>
      <Stack gap="md">
        <Title order={5}>Chi tiết đồ giặt</Title>
        {itemTable}
        {conditionNotes}
      </Stack>
      {imagePreview}
    </Card>
  )
}
