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
import type { ReactNode } from 'react'
import { EmptyState } from '../feedback/EmptyState'

export interface DataTableColumn<T> {
  name: string
  label: ReactNode
  render?: (row: T, index: number) => ReactNode
  width?: number
  align?: 'left' | 'center' | 'right'
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
  const body = loading ? (
    <Center h={200}>
      <Loader />
    </Center>
  ) : data.length === 0 ? (
    (empty ?? <EmptyState title="Không có dữ liệu" />)
  ) : (
    <Table highlightOnHover stickyHeaderOffset={60}>
      <Table.Thead>
        <Table.Tr>
          {columns.map((col) => (
            <Table.Th key={col.name} w={col.width} ta={col.align}>
              {col.label}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row, i) => (
          <Table.Tr key={rowKey(row)} {...rowProps?.(row, i)}>
            {columns.map((col) => (
              <Table.Td key={col.name} ta={col.align}>
                {col.render ? col.render(row, i) : (row as Record<string, ReactNode>)[col.name]}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
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
