import {
  ActionIcon,
  Box,
  Button,
  Chip,
  FileButton,
  Grid,
  Group,
  Image,
  Input,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { useState } from 'react'
import { LuImagePlus, LuPlus, LuTrash2, LuX } from 'react-icons/lu'
import { UNIT_LABEL, type Service } from '@/features/services'
import { useObjectUrl } from '@/shared/hooks/useObjectUrl'
import { formatMoney } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { IconButton, InfoLabel } from '@/shared/ui'
import { billable, isBelowMinimum } from '../../domain/pricing'
import { IMAGE_TYPES, splitImages, type validateLine } from '../../domain/rules'
import { CONDITION_TAGS, type OrderLine, type OrderType } from '../../domain/types'

const DASHED = { border: '1px dashed var(--ds-border)' }
const ADD_TILE = {
  ...DASHED,
  width: 64,
  height: 64,
  borderRadius: 'var(--mantine-radius-sm)',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--ds-muted-foreground)',
}

const LINE_BOX = { border: '1px solid var(--ds-border)', borderRadius: 'var(--radius-control)' }

interface ItemLineEditorProps {
  index: number
  line: OrderLine
  services: Service[]
  orderType: OrderType
  lineTotal: number
  errors: ReturnType<typeof validateLine>
  /** Đơn tiếp nhận v3: dòng theo dịch vụ (tên dịch vụ là loại đồ), tính theo tối thiểu */
  byService?: boolean
  /** Nằm trong hàng checklist dịch vụ: không có tiêu đề dòng, nút xóa, ô chọn dịch vụ, khung viền */
  embedded?: boolean
  onChange: (patch: Partial<OrderLine>) => void
  onRemove?: () => void
}

function Thumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useObjectUrl(file)
  return (
    <Box pos="relative" w={64} h={64}>
      {url && <Image src={url} w={64} h={64} radius="sm" fit="cover" alt={file.name} />}
      {/* Nút nhỏ nằm trong góc ảnh: IconButton chuẩn (cỡ control) quá to so với ảnh 64px */}
      <Tooltip label="Xóa ảnh">
        <ActionIcon
          aria-label="Xóa ảnh"
          color="red"
          variant="filled"
          radius="xl"
          pos="absolute"
          top={4}
          right={4}
          style={{ '--ai-size': '22px' }}
          onClick={onRemove}
        >
          <LuTrash2 size={12} />
        </ActionIcon>
      </Tooltip>
    </Box>
  )
}

function addImages(current: File[], files: File[]) {
  const { ok, rejected } = splitImages(files)
  if (rejected) notify.error('Chỉ nhận ảnh PNG/JPG, tối đa 5MB mỗi ảnh')
  return [...current, ...ok]
}

export function ItemLineEditor({
  index,
  line,
  services,
  orderType,
  lineTotal,
  errors,
  byService,
  embedded,
  onChange,
  onRemove,
}: ItemLineEditorProps) {
  const [showCondition, setShowCondition] = useState(
    line.conditionTags.length > 0 || !!line.conditionText || line.localImages.length > 0,
  )
  const service = services.find((s) => s.id === line.serviceId)
  const unitLabel = UNIT_LABEL[line.unit]
  const noExpress = orderType === 'EXPRESS' && service && !service.expressSupported

  const pickService = (id: string | null) => {
    const s = services.find((x) => x.id === Number(id))
    // Chốt đơn giá hiện hành tại thời điểm chọn
    if (!s) return
    const base = { serviceId: s.id, unit: s.unit ?? 'PIECE', unitPrice: s.price } as const
    onChange(byService ? { ...base, itemType: s.name, minQuantity: s.minQuantity } : base)
  }
  const belowMin = isBelowMinimum(line)
  const priceNote = !line.serviceId
    ? 'Chưa chọn dịch vụ'
    : belowMin
      ? `tính ${line.minQuantity} ${unitLabel} (dưới tối thiểu)`
      : `${formatMoney(line.unitPrice)} × ${billable(line)}`

  // Giữ thứ tự tag cố định khi ghép vào ghi chú, bất kể thứ tự bấm
  const setTags = (tags: string[]) =>
    onChange({ conditionTags: CONDITION_TAGS.filter((t) => tags.includes(t)) })

  const qtyProps = {
    // Đơn vị đưa lên nhãn: ô hẹp, hậu tố như "món" sẽ tràn viền
    label: `${line.unit === 'KG' ? 'Khối lượng (kg)' : `Số lượng (${unitLabel})`}${
      byService && line.minQuantity ? ` · tối thiểu ${line.minQuantity}` : ''
    }`,
    placeholder: '0',
    value: line.quantity,
    onChange: (v: string | number) => onChange({ quantity: v === '' ? '' : Number(v) }),
    error: errors.quantity,
    min: 0,
  }

  const lineFields = (
    <Grid gap="sm" align="flex-start">
      {!byService && (
        <Grid.Col span={12}>
          <TextInput
            label="Loại đồ"
            placeholder="Áo sơ mi, quần tây…"
            value={line.itemType}
            onChange={(e) => onChange({ itemType: e.currentTarget.value })}
            error={errors.itemType}
          />
        </Grid.Col>
      )}
      {!embedded && (
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Select
            label="Dịch vụ"
            searchable
            placeholder="Chọn dịch vụ"
            data={services.map((s) => ({
              value: String(s.id),
              label: `${s.name}${s.unit ? ` (${UNIT_LABEL[s.unit]})` : ''}`,
            }))}
            value={line.serviceId ? String(line.serviceId) : null}
            onChange={pickService}
            error={errors.serviceId}
          />
        </Grid.Col>
      )}
      <Grid.Col span={{ base: 12, sm: embedded ? 6 : 3 }}>
        <NumberInput
          {...qtyProps}
          hideControls
          allowNegative={false}
          decimalSeparator=","
          // KG cho phép lẻ 2 chữ số; món/bộ/sản phẩm chỉ số nguyên
          {...(line.unit === 'KG' ? { decimalScale: 2 } : { allowDecimal: false })}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: embedded ? 6 : 4 }}>
        <Input.Wrapper label="Thành tiền">
          {/* Ô chỉ đọc cao bằng ô nhập để hàng thẳng */}
          <Group
            justify="space-between"
            wrap="nowrap"
            px="sm"
            h="var(--ds-control-height-md)"
            bg="var(--ds-muted)"
            style={{ borderRadius: 'var(--radius-control)' }}
          >
            <Text size="xs" c={belowMin ? 'var(--tone-warning-fg)' : 'dimmed'} truncate>
              {priceNote}
            </Text>
            <Text fw={700}>{formatMoney(lineTotal)}</Text>
          </Group>
        </Input.Wrapper>
      </Grid.Col>
    </Grid>
  )

  const conditionEditor = (
    <Stack gap="sm" p="sm" bg="var(--ds-muted)" style={{ borderRadius: 'var(--radius-control)' }}>
      <Chip.Group multiple value={line.conditionTags} onChange={setTags}>
        <Group gap="xs">
          {CONDITION_TAGS.map((tag) => (
            <Chip key={tag} value={tag} size="sm" variant="outline">
              {tag}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
      <TextInput
        aria-label="Mô tả tình trạng"
        placeholder="Mô tả tình trạng (VD cổ áo có vết ố vàng)"
        value={line.conditionText}
        onChange={(e) => onChange({ conditionText: e.currentTarget.value })}
      />
      <Group gap="sm" align="center">
        {line.localImages.map((file, i) => (
          <Thumb
            key={`${file.name}-${i}`}
            file={file}
            onRemove={() => onChange({ localImages: line.localImages.filter((_, j) => j !== i) })}
          />
        ))}
        <FileButton
          multiple
          accept={IMAGE_TYPES.join(',')}
          onChange={(files) => onChange({ localImages: addImages(line.localImages, files) })}
        >
          {(props) =>
            // Đã có ảnh: ô "+" cùng cỡ ảnh để nối tiếp hàng; chưa có: nút có chữ
            line.localImages.length ? (
              <Tooltip label="Thêm ảnh">
                <UnstyledButton {...props} aria-label="Thêm ảnh tình trạng" style={ADD_TILE}>
                  <LuPlus size={20} />
                </UnstyledButton>
              </Tooltip>
            ) : (
              <Button
                {...props}
                size="xs"
                variant="subtle"
                color="neutral"
                leftSection={<LuImagePlus size={14} />}
                style={DASHED}
              >
                Thêm ảnh
              </Button>
            )
          }
        </FileButton>
      </Group>
    </Stack>
  )

  const conditionToggle = (
    <Group gap="xs">
      <Button
        variant="subtle"
        size="xs"
        leftSection={<LuPlus size={14} />}
        onClick={() => setShowCondition(true)}
      >
        <InfoLabel info="Chỉ với món có vấn đề (vết bẩn, rách, dễ phai…)">
          Ghi chú tình trạng / ảnh
        </InfoLabel>
      </Button>
    </Group>
  )

  return (
    <Stack gap="sm" p={embedded ? 0 : 'md'} style={embedded ? undefined : LINE_BOX}>
      {!embedded && (
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600}>Dòng {index + 1}</Text>
          <IconButton label="Xóa dòng" icon={<LuX size={16} />} onClick={onRemove} />
        </Group>
      )}
      {lineFields}
      {noExpress && (
        <Text size="sm" c="var(--ds-warning, orange)">
          Dịch vụ không hỗ trợ giặt nhanh – không tính phụ phí cho dòng này
        </Text>
      )}
      {showCondition ? conditionEditor : conditionToggle}
    </Stack>
  )
}
