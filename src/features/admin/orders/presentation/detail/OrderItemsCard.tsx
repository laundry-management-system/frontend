import { Badge, Card, Group, Image, Stack, Table, Text, Title, UnstyledButton } from '@mantine/core'
import { useState } from 'react'
import { LuPackageOpen } from 'react-icons/lu'
import { UNIT_LABEL, useActiveServices } from '@/features/admin/services'
import { EmptyState, ImageLightbox, Money } from '@/shared/admin/ui'
import { isExtraService } from '../../domain/extraService'
import type { OrderImage, OrderLine, RequestedService } from '../../domain/types'
import { ExtraServiceTag } from '../ExtraServiceTag'

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
  requestedServices,
  expressFee = 0,
  whitesFee = 0,
}: {
  items: OrderLine[]
  requestedServices: RequestedService[]
  expressFee?: number
  whitesFee?: number
}) {
  // shortcut: tên dịch vụ lấy từ danh sách đang hoạt động; dịch vụ đã ngừng hiện "—" (BE không trả tên trong dòng đồ)
  const { data: services = [] } = useActiveServices()
  const [preview, setPreview] = useState<{ images: OrderImage[]; index: number } | null>(null)
  const changePreview = (index: number | null) =>
    setPreview((p) => (p && index !== null ? { ...p, index } : null))

  if (!items.length)
    return (
      <Card>
        <Title order={5} mb="sm">
          Chi tiết đồ giặt
        </Title>
        <EmptyState
          icon={<LuPackageOpen size={32} />}
          title="Chưa phân loại"
          description="Khối lượng, dịch vụ và giá sẽ hiện ở đây sau khi phân loại."
        />
      </Card>
    )

  const serviceName = (id: number | null) => services.find((s) => s.id === id)?.name ?? '—'

  const feeRows = [
    { label: 'Phụ phí giặt nhanh', amount: expressFee },
    { label: 'Giặt riêng đồ trắng', amount: whitesFee },
  ]
    .filter((f) => f.amount > 0)
    .map((f) => (
      <Table.Tr key={f.label} style={{ background: 'var(--ds-secondary)' }}>
        <Table.Td />
        <Table.Td fw={500}>{f.label}</Table.Td>
        <Table.Td />
        <Table.Td />
        <Table.Td>
          <Money value={f.amount} />
        </Table.Td>
      </Table.Tr>
    ))

  const itemTable = (
    <Table fz="md" styles={{ td: { fontSize: 'var(--mantine-font-size-md)' } }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={30} ta="center">
            #
          </Table.Th>
          <Table.Th>Dịch vụ</Table.Th>
          <Table.Th w={90} ta="center">
            SL/KL
          </Table.Th>
          <Table.Th w={100}>Đơn giá</Table.Th>
          <Table.Th w={110}>Thành tiền</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((l, i) => (
          <Table.Tr key={l.id ?? i}>
            <Table.Td ta="center">{i + 1}</Table.Td>
            <Table.Td>
              <Group gap={6}>
                {serviceName(l.serviceId)}
                {isExtraService(l.serviceId, requestedServices) && <ExtraServiceTag />}
              </Group>
              {l.itemType !== serviceName(l.serviceId) && (
                <Text size="sm" c="dimmed">
                  {l.itemType}
                </Text>
              )}
            </Table.Td>
            <Table.Td ta="center" style={{ whiteSpace: 'nowrap' }}>
              {qty(l)}
            </Table.Td>
            <Table.Td>
              <Money value={l.unitPrice} />
            </Table.Td>
            <Table.Td>
              <Money value={Math.round(l.unitPrice * billed(l))} />
            </Table.Td>
          </Table.Tr>
        ))}
        {feeRows}
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
    <ImageLightbox
      images={preview?.images ?? []}
      index={preview?.index ?? null}
      onIndexChange={changePreview}
    />
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
