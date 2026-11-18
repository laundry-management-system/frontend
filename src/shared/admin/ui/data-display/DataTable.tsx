import {
  Card,
  Center,
  Group,
  Loader,
  Pagination,
  Stack,
  Table,
  type TableTrProps,
} from '@mantine/core'
import type { KeyboardEvent, ReactNode } from 'react'
import { EmptyState } from '../feedback/EmptyState'

export interface DataTableColumn<T> {
  name: string
  label: ReactNode
  render?: (row: T, index: number) => ReactNode
  width?: number
  align?: 'left' | 'center' | 'right'
  /**
   * Ghim cột khi cuộn ngang. Các cột cố định liền kề cần `width` để tính vị trí
   * (cột cố định trong cùng – sát vùng cuộn – có thể không đặt width).
   */
  fixed?: 'left' | 'right'
}

/** Vị trí sticky của từng cột: cộng dồn width các cột cố định cùng phía nằm ngoài nó. */
function fixedStyles<T>(columns: DataTableColumn<T>[]) {
  return columns.map((col, i) => {
    if (!col.fixed) return undefined
    const side = col.fixed
    const outer = side === 'left' ? columns.slice(0, i) : columns.slice(i + 1)
    const offset = outer.filter((c) => c.fixed === side).reduce((sum, c) => sum + (c.width ?? 0), 0)
    return {
      className: 'ds-fixed-col',
      style: { [side]: offset },
    }
  })
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  empty?: ReactNode
  rowProps?: (row: T, index: number) => TableTrProps
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

// Dòng bấm được (mở chi tiết, không có cột thao tác) phải mở được bằng bàn phím
const openOnEnter = (e: KeyboardEvent<HTMLTableRowElement>) => {
  if (e.key === 'Enter' && e.target === e.currentTarget) e.currentTarget.click()
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  empty,
  rowProps,
  page,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  const fixed = fixedStyles(columns)
  const body = loading ? (
    <Center h={200}>
      <Loader />
    </Center>
  ) : data.length === 0 ? (
    (empty ?? <EmptyState title="Không có dữ liệu" />)
  ) : (
    // Card ẩn phần tràn: cho cuộn ngang khi tổng độ rộng cột vượt màn hình (cột tự co tính tạm 160px)
    <Table.ScrollContainer minWidth={columns.reduce((sum, c) => sum + (c.width ?? 160), 0)}>
      <Table highlightOnHover stickyHeaderOffset={60}>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col, c) => (
              <Table.Th key={col.name} w={col.width} ta={col.align} {...fixed[c]}>
                {col.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row, i) => {
            const props = rowProps?.(row, i)
            return (
              <Table.Tr
                key={rowKey(row)}
                {...(props?.onClick && { tabIndex: 0, onKeyDown: openOnEnter })}
                {...props}
              >
                {columns.map((col, c) => (
                  <Table.Td key={col.name} ta={col.align} {...fixed[c]}>
                    {col.render ? col.render(row, i) : (row as Record<string, ReactNode>)[col.name]}
                  </Table.Td>
                ))}
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )

  return (
    <Stack gap="md">
      <Card p={0}>{body}</Card>
      {totalPages !== undefined && onPageChange && (
        <Group justify="flex-end">
          <Pagination total={Math.max(totalPages, 1)} value={page} onChange={onPageChange} />
        </Group>
      )}
    </Stack>
  )
}
