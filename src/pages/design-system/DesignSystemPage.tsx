import {
  Alert,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Group,
  Menu,
  Pagination,
  PasswordInput,
  Radio,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Badge,
  Anchor,
} from '@mantine/core'
import { useState, type ReactNode } from 'react'
import { LuEllipsis, LuInbox, LuMessageCircle, LuPrinter } from 'react-icons/lu'
import { DOMAIN_STATUSES, GROUP_LABEL, type StatusGroup } from '@/shared/config/domainStatuses'
import { notify } from '@/shared/lib/notify'
import {
  ConfirmModal,
  CopyableCode,
  EmptyState,
  IconButton,
  Money,
  MoneyInput,
  OrderCode,
  PageHeader,
  StatTile,
  StatusBadge,
  WeightInput,
} from '@/shared/ui'

const SEMANTIC = [
  'background',
  'foreground',
  'surface',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'muted',
  'muted-foreground',
  'border',
  'input',
  'ring',
  'primary',
  'primary-hover',
  'primary-foreground',
  'secondary',
  'secondary-hover',
  'secondary-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-hover',
  'destructive-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'info',
  'info-foreground',
  'overlay',
]
const TONES = ['neutral', 'primary', 'info', 'success', 'warning', 'express', 'danger', 'vip']
const TONE_PARTS = ['bg', 'fg', 'border', 'solid', 'solid-fg']

// Tên class đầy đủ để Tailwind quét được (không ghép chuỗi động)
const TEXT_STYLES = [
  'text-display',
  'text-h1',
  'text-h2',
  'text-h3',
  'text-h4',
  'text-body-lg',
  'text-body-md',
  'text-body-md-strong',
  'text-body-sm',
  'text-label-lg',
  'text-label-md',
  'text-label-sm',
  'text-caption',
  'text-overline',
  'text-numeric-display',
  'text-money',
  'text-code-md',
  'text-code-sm',
  'text-print-title',
  'text-print-body',
  'text-print-small',
]
const sampleText = (style: string) =>
  style.includes('numeric') || style === 'text-money'
    ? '3.250.000đ'
    : style.includes('code')
      ? 'LD-20260916-001'
      : 'Tiệm Giặt Ủi – Đơn đã sẵn sàng'

const BUTTON_VARIANTS = [
  { label: 'Primary', props: { variant: 'filled' } },
  { label: 'Secondary', props: { variant: 'secondary' } },
  { label: 'Outline', props: { variant: 'outline' } },
  { label: 'Ghost', props: { variant: 'subtle' } },
  { label: 'Destructive', props: { variant: 'filled', color: 'danger' } },
] as const

const swatch = (cssVar: string) => ({ background: `var(${cssVar})` })

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h3">{title}</h2>
      {children}
    </section>
  )
}

const DENSITY_OPTIONS = [
  { value: 'counter', label: 'Counter' },
  { value: 'admin', label: 'Admin' },
]

export default function DesignSystemPage() {
  const [density, setDensity] = useState('counter')
  const [modal, setModal] = useState<'confirm' | 'destructive' | 'reason' | null>(null)
  const closeModal = () => setModal(null)
  const openConfirm = () => setModal('confirm')
  const openDestructive = () => setModal('destructive')
  const openReason = () => setModal('reason')
  const confirmReason = (reason?: string) => {
    notify.info(`Lý do: ${reason}`)
    setModal(null)
  }
  const toastSuccess = () => notify.success('Đã in phiếu nhận đồ')
  const toastError = () => notify.error('Không in được phiếu', 'Lỗi')
  const groups = [...new Set(DOMAIN_STATUSES.map((s) => s.group))] as StatusGroup[]

  const headerActions = (
    <SegmentedControl value={density} onChange={setDensity} data={DENSITY_OPTIONS} />
  )

  const colorSection = (
    <Section title="Màu ngữ nghĩa">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {SEMANTIC.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className="size-8 shrink-0 rounded-control border border-border"
              style={swatch(`--ds-${name}`)}
            />
            <span className="text-caption">{name}</span>
          </div>
        ))}
      </div>
    </Section>
  )

  const toneSection = (
    <Section title="Tone">
      <div className="flex flex-col gap-2">
        {TONES.map((tone) => (
          <div key={tone} className="flex flex-wrap items-center gap-2">
            <span className="text-label-sm w-16">{tone}</span>
            {TONE_PARTS.map((part) => (
              <div
                key={part}
                title={`--tone-${tone}-${part}`}
                className="size-8 rounded-control border border-border"
                style={swatch(`--tone-${tone}-${part}`)}
              />
            ))}
            {/* Mẫu chữ thật để đo tương phản bằng DevTools */}
            <span
              className="text-label-md rounded-control px-3 py-1"
              style={{ background: `var(--tone-${tone}-bg)`, color: `var(--tone-${tone}-fg)` }}
            >
              Aa 185.000đ
            </span>
            <span
              className="text-label-md rounded-control px-3 py-1"
              style={{
                background: `var(--tone-${tone}-solid)`,
                color: `var(--tone-${tone}-solid-fg)`,
              }}
            >
              Aa 185.000đ
            </span>
          </div>
        ))}
      </div>
    </Section>
  )

  const typographySection = (
    <Section title="Typography">
      <div className="flex flex-col gap-2">
        {TEXT_STYLES.map((style) => (
          <div key={style} className="flex items-baseline gap-4">
            <span className="text-caption text-muted-foreground w-36 shrink-0">{style}</span>
            <span className={style}>{sampleText(style)}</span>
          </div>
        ))}
      </div>
    </Section>
  )

  const shadowSection = (
    <Section title="Shadow">
      <div className="flex flex-wrap gap-4">
        {['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-focus'].map(
          (s) => (
            <div key={s} className={`bg-card rounded-card text-caption p-4 ${s}`}>
              {s}
            </div>
          ),
        )}
      </div>
    </Section>
  )

  const buttonSection = (
    <Section title="Button">
      {BUTTON_VARIANTS.map(({ label, props }) => (
        <Group key={label}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} size={size} {...props}>
              {label} {size.toUpperCase()}
            </Button>
          ))}
          <Button {...props} disabled>
            Disabled
          </Button>
          <Button {...props} loading>
            Loading
          </Button>
        </Group>
      ))}
      <Group>
        <IconButton label="In phiếu" icon={<LuPrinter size={18} />} variant="filled" />
        <IconButton label="Nhắn khách" icon={<LuMessageCircle size={18} />} variant="outline" />
        <IconButton label="Thêm" icon={<LuEllipsis size={18} />} />
      </Group>
    </Section>
  )

  const inputSection = (
    <Section title="Input">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <TextInput label="Tên khách" placeholder="Nguyễn Văn An" />
        <TextInput label="Số điện thoại" defaultValue="090" error="SĐT không hợp lệ" />
        <TextInput label="Disabled" disabled defaultValue="Không sửa được" />
        <PasswordInput label="Mật khẩu" />
        <Select label="Dịch vụ" data={['Giặt sấy', 'Giặt hấp', 'Ủi']} defaultValue="Giặt sấy" />
        <MoneyInput label="Đơn giá" defaultValue={185000} />
        <WeightInput label="Khối lượng" defaultValue={3.5} />
      </SimpleGrid>
      <Textarea label="Lý do" />
      <Group>
        <Checkbox label="Chưa chọn" />
        <Checkbox label="Đã chọn" defaultChecked />
        <Checkbox label="Indeterminate" indeterminate />
        <Checkbox label="Disabled" disabled />
      </Group>
      <Radio.Group defaultValue="cash">
        <Group>
          <Radio value="cash" label="Tiền mặt" />
          <Radio value="qr" label="Chuyển khoản (QR)" />
          <Radio value="x" label="Disabled" disabled />
        </Group>
      </Radio.Group>
      <Group>
        <Switch label="Tắt" />
        <Switch label="Khách VIP" defaultChecked />
        <Switch label="Disabled" disabled />
      </Group>
      <Group>
        <SegmentedControl data={['Thường', 'Giặt nhanh']} />
        <SegmentedControl data={['Tiền mặt', 'Chuyển khoản']} />
      </Group>
    </Section>
  )

  const badgeSection = (
    <Section title="Badge">
      {(['light', 'filled'] as const).map((variant) => (
        <Group key={variant}>
          {TONES.map((tone) => (
            <Group key={tone} gap={4}>
              <Badge color={tone} variant={variant} size="sm">
                {tone}
              </Badge>
              <Badge color={tone} variant={variant} size="md">
                {tone}
              </Badge>
            </Group>
          ))}
        </Group>
      ))}
    </Section>
  )

  const dataSection = (
    <Section title="Card · Stat Tile · Table · Pagination">
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <StatTile
          label="Doanh thu hôm nay"
          value="3.250.000đ"
          delta="12% so với hôm qua"
          trend="up"
        />
        <StatTile label="Đơn trễ" value="4" delta="8% so với hôm qua" trend="down" />
        <StatTile label="Đồ tồn" value="7" delta="Không đổi" />
      </SimpleGrid>
      <Card>
        <div className="text-h4">Tiêu đề card</div>
        <div className="text-body-md text-muted-foreground">
          Nội dung card – padding theo density.
        </div>
      </Card>
      <Card p={0}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Mã đơn</Table.Th>
              <Table.Th>Khách hàng</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th ta="right">Tổng tiền</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[
              ['LD-20260916-001', 'Nguyễn Văn An', 'processing', 185000],
              ['LD-20260916-002', 'Trần Thị Bình', 'completed', 210000],
            ].map(([code, name, status, total]) => (
              <Table.Tr key={code}>
                <Table.Td>
                  <OrderCode code={code as string} />
                </Table.Td>
                <Table.Td>{name}</Table.Td>
                <Table.Td>
                  <StatusBadge group="order" statusKey={status as string} />
                </Table.Td>
                <Table.Td ta="right">
                  <Money value={total as number} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
      <Pagination total={12} />
    </Section>
  )

  const feedbackSection = (
    <Section title="Feedback">
      <Alert color="info" title="Thông báo">
        Đơn mới sẽ được in phiếu tự động.
      </Alert>
      <Alert color="danger" title="Lỗi">
        Không kết nối được máy in.
      </Alert>
      <Stack gap="xs">
        <Skeleton h={16} w="60%" />
        <Skeleton h={16} w="40%" />
      </Stack>
      <Card>
        <EmptyState
          icon={<LuInbox size={32} />}
          title="Chưa có đơn nào"
          description="Đơn mới tạo sẽ hiện ở đây."
          action={<Button>Tạo đơn</Button>}
        />
      </Card>
      <Group>
        <Button variant="outline" onClick={toastSuccess}>
          Toast thành công
        </Button>
        <Button variant="outline" color="danger" onClick={toastError}>
          Toast lỗi
        </Button>
      </Group>
    </Section>
  )

  const navigationSection = (
    <Section title="Navigation">
      <Breadcrumbs>
        <Anchor href="#">Đơn hàng</Anchor>
        <span className="text-code-md">LD-20260916-001</span>
      </Breadcrumbs>
      <Tabs defaultValue="all">
        <Tabs.List>
          <Tabs.Tab
            value="all"
            rightSection={
              <Badge size="sm" color="neutral">
                24
              </Badge>
            }
          >
            Tất cả
          </Tabs.Tab>
          <Tabs.Tab
            value="new"
            rightSection={
              <Badge size="sm" color="info">
                5
              </Badge>
            }
          >
            Mới nhận
          </Tabs.Tab>
          <Tabs.Tab
            value="processing"
            rightSection={
              <Badge size="sm" color="primary">
                12
              </Badge>
            }
          >
            Đang xử lý
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Menu>
        <Menu.Target>
          <Button variant="outline" w="fit-content">
            Thao tác
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>Xem chi tiết</Menu.Item>
          <Menu.Item leftSection={<LuPrinter size={14} />}>In lại phiếu</Menu.Item>
          <Menu.Item leftSection={<LuMessageCircle size={14} />}>Nhắn khách</Menu.Item>
          <Menu.Divider />
          <Menu.Item color="red">Hủy đơn</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Section>
  )

  const modalSection = (
    <Section title="Modal">
      <Group>
        <Button variant="outline" onClick={openConfirm}>
          Confirm
        </Button>
        <Button variant="outline" onClick={openDestructive}>
          Destructive
        </Button>
        <Button variant="outline" onClick={openReason}>
          Reason
        </Button>
      </Group>
      <ConfirmModal
        opened={modal === 'confirm'}
        onClose={closeModal}
        onConfirm={closeModal}
        kind="confirm"
        title="Xác nhận đã nhận tiền?"
      >
        Đơn LD-20260916-001 · 185.000đ · Chuyển khoản (QR). Chỉ xác nhận khi đã thấy tiền về tài
        khoản.
      </ConfirmModal>
      <ConfirmModal
        opened={modal === 'destructive'}
        onClose={closeModal}
        onConfirm={closeModal}
        kind="destructive"
        title="Hủy đơn này?"
        confirmLabel="Hủy đơn"
      >
        Chỉ hủy được khi đơn còn ở trạng thái Mới nhận. Lượt voucher sẽ được trả lại.
      </ConfirmModal>
      <ConfirmModal
        opened={modal === 'reason'}
        onClose={closeModal}
        onConfirm={confirmReason}
        kind="reason"
        title="Lùi trạng thái về Đang xử lý"
      >
        Thao tác này được ghi vào nhật ký hệ thống kèm lý do.
      </ConfirmModal>
    </Section>
  )

  const domainSection = (
    <Section title="Domain">
      {groups.map((group) => (
        <Group key={group}>
          <span className="text-label-sm w-24">{GROUP_LABEL[group]}</span>
          {DOMAIN_STATUSES.filter((s) => s.group === group).map((s) => (
            <StatusBadge key={s.key} group={group} statusKey={s.key} />
          ))}
        </Group>
      ))}
      <Group>
        <OrderCode code="LD-20260916-001" />
        <CopyableCode code="LD-20260907-002" />
        <Money value={185000} />
        <Money value={210000} size="display" />
      </Group>
    </Section>
  )

  return (
    <div data-density={density === 'admin' ? 'admin' : undefined}>
      <PageHeader
        title="Laundry DS"
        description="Trang đối chiếu token và component với design-system.html (chỉ có ở dev)"
        actions={headerActions}
      />

      <Stack gap="var(--ds-section-gap)">
        {colorSection}

        {toneSection}

        {typographySection}

        {shadowSection}

        {buttonSection}

        {inputSection}

        {badgeSection}

        {dataSection}

        {feedbackSection}

        {navigationSection}

        {modalSection}

        {domainSection}
      </Stack>
    </div>
  )
}
