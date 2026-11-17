import {
  Badge,
  Box,
  Card,
  CloseButton,
  FileButton,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { type ReactNode, useState } from 'react'
import { LuCamera, LuImageOff, LuImagePlus, LuPackageCheck } from 'react-icons/lu'
import { toApiError } from '@/shared/api/apiError'
import { imageFileError } from '@/shared/lib/imageFile'
import { notify } from '@/shared/lib/notify'
import { ImageLightbox, InfoLabel } from '@/shared/ui'
import { useUploadIncidentImage } from '../../application/mutations/useUploadIncidentImage'
import { MAX_INCIDENT_IMAGES } from '../../domain/rules'
import type { IncidentImage } from '../../domain/types'

const THUMB = 96
const ACCEPT = 'image/png,image/jpeg,image/webp'
const PANEL_STYLE = {
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--mantine-radius-md)',
}
const TILE_STYLE = {
  width: THUMB,
  height: THUMB,
  borderRadius: 'var(--mantine-radius-sm)',
}
const ADD_TILE_STYLE = {
  ...TILE_STYLE,
  border: '1px dashed var(--ds-border)',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  color: 'var(--mantine-color-dimmed)',
}
const EMPTY_STYLE = {
  border: '1px dashed var(--ds-border)',
  borderRadius: 'var(--mantine-radius-sm)',
  minHeight: THUMB,
}
const NOTE_STYLE = {
  background: 'var(--mantine-color-gray-0)',
  borderRadius: 'var(--mantine-radius-sm)',
}
const REMOVE_STYLE = { position: 'absolute' as const, top: 4, right: 4 }

type Preview = { images: IncidentImage[]; index: number } | null

function Panel({
  icon,
  title,
  meta,
  children,
}: {
  icon: ReactNode
  title: string
  meta?: ReactNode
  children: ReactNode
}) {
  return (
    <Stack gap="sm" p="md" style={PANEL_STYLE}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap={6} wrap="nowrap">
          {icon}
          <Text fw={600} size="sm">
            {title}
          </Text>
        </Group>
        {meta}
      </Group>
      {children}
    </Stack>
  )
}

function Thumbs({
  images,
  onOpen,
  onRemove,
}: {
  images: IncidentImage[]
  onOpen: (index: number) => void
  onRemove?: (index: number) => void
}) {
  return images.map((img, i) => (
    <Box key={img.id} pos="relative" style={TILE_STYLE}>
      <UnstyledButton onClick={() => onOpen(i)} aria-label={`Xem ảnh ${i + 1}`}>
        <Image src={img.imageUrl} w={THUMB} h={THUMB} radius="sm" fit="cover" alt="" />
      </UnstyledButton>
      {onRemove && (
        <CloseButton
          size="sm"
          variant="filled"
          style={REMOVE_STYLE}
          aria-label={`Bỏ ảnh ${i + 1}`}
          onClick={() => onRemove(i)}
        />
      )}
    </Box>
  ))
}

function EmptyPhotos({ label }: { label: string }) {
  return (
    <Stack gap={4} align="center" justify="center" style={EMPTY_STYLE}>
      <LuImageOff size={20} color="var(--mantine-color-dimmed)" aria-hidden />
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Stack>
  )
}

export function ConditionCompareCard({
  initialImages,
  initialNote,
  images,
  onImagesChange,
  readOnly,
  error,
}: {
  initialImages: IncidentImage[]
  initialNote: string | null
  images: IncidentImage[]
  onImagesChange: (images: IncidentImage[]) => void
  readOnly: boolean
  error?: string
}) {
  const upload = useUploadIncidentImage()
  const [preview, setPreview] = useState<Preview>(null)
  const changePreview = (index: number | null) =>
    setPreview((p) => (p && index !== null ? { ...p, index } : null))
  const openInitial = (index: number) => setPreview({ images: initialImages, index })
  const openCurrent = (index: number) => setPreview({ images, index })
  const removeCurrent = (index: number) => onImagesChange(images.filter((_, i) => i !== index))
  const canAdd = !readOnly && images.length < MAX_INCIDENT_IMAGES

  const handleFile = (file: File | null) => {
    if (!file) return
    if (images.length >= MAX_INCIDENT_IMAGES) return notify.error('Tối đa 6 ảnh hiện tại')
    const invalid = imageFileError(file)
    if (invalid) return notify.error(invalid)
    upload.mutate(file, {
      onSuccess: (doc) => onImagesChange([...images, { id: doc.id, imageUrl: doc.url }]),
      onError: (e) => notify.error(toApiError(e).message),
    })
  }

  const initialPanel = (
    <Panel icon={<LuPackageCheck size={16} aria-hidden />} title="Lúc nhận đồ">
      {initialImages.length ? (
        <Group gap="xs">
          <Thumbs images={initialImages} onOpen={openInitial} />
        </Group>
      ) : (
        <EmptyPhotos label="Không có ảnh lúc nhận" />
      )}
      {initialNote && (
        <Box p="xs" style={NOTE_STYLE}>
          <Text size="xs" c="dimmed">
            Ghi chú tình trạng
          </Text>
          <Text size="sm">{initialNote}</Text>
        </Box>
      )}
    </Panel>
  )

  const addTile = (
    <FileButton onChange={handleFile} accept={ACCEPT}>
      {(props) => (
        <UnstyledButton
          {...props}
          className="ds-focus"
          style={ADD_TILE_STYLE}
          disabled={upload.isPending}
          aria-label="Thêm ảnh hiện tại"
        >
          {upload.isPending ? <Loader size="sm" /> : <LuImagePlus size={20} aria-hidden />}
          <Text size="xs">Thêm ảnh</Text>
        </UnstyledButton>
      )}
    </FileButton>
  )

  const currentPanel = (
    <Panel
      icon={<LuCamera size={16} aria-hidden />}
      title="Hiện tại"
      meta={
        !readOnly && (
          <Badge variant="light" color="gray" size="sm">
            {images.length}/{MAX_INCIDENT_IMAGES}
          </Badge>
        )
      }
    >
      {readOnly && !images.length ? (
        <EmptyPhotos label="Không có ảnh" />
      ) : (
        <Group gap="xs">
          <Thumbs
            images={images}
            onOpen={openCurrent}
            onRemove={readOnly ? undefined : removeCurrent}
          />
          {canAdd && addTile}
        </Group>
      )}
      {error && (
        <Text size="sm" c="red">
          {error}
        </Text>
      )}
    </Panel>
  )

  return (
    <Card>
      <Stack gap="md">
        <Title order={5}>
          <InfoLabel info="So ảnh và ghi chú lúc nhận với tình trạng hiện tại. Lịch sử trạng thái đơn giúp khoanh vùng ai nhận / xử lý / giao, lúc nào.">
            Đối chiếu tình trạng
          </InfoLabel>
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {initialPanel}
          {currentPanel}
        </SimpleGrid>
      </Stack>
      <ImageLightbox
        images={preview?.images ?? []}
        index={preview?.index ?? null}
        onIndexChange={changePreview}
      />
    </Card>
  )
}
