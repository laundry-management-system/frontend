import { Button, Card, Group } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuPlus } from 'react-icons/lu'
import { DataTable, type DataTableProps } from '../data-display/DataTable'
import { EmptyState } from '../feedback/EmptyState'
import { PageHeader } from './PageHeader'

export interface ListPageProps<T> extends DataTableProps<T> {
  title: string
  description?: string
  primaryAction?: { label: string; onClick: () => void; icon?: ReactNode }
  actions?: ReactNode
  filters?: ReactNode
  error?: boolean
  onRetry?: () => void
  children?: ReactNode
}

export function ListPage<T>({
  title,
  description,
  primaryAction,
  actions,
  filters,
  error,
  onRetry,
  empty,
  children,
  ...table
}: ListPageProps<T>) {
  const headerActions =
    actions || primaryAction ? (
      <Group gap="sm">
        {actions}
        {primaryAction && (
          <Button
            leftSection={primaryAction.icon ?? <LuPlus size={16} />}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
      </Group>
    ) : undefined

  return (
    <>
      <PageHeader title={title} description={description} actions={headerActions} />
      {filters && (
        <Card mb="md">
          <Group>{filters}</Group>
        </Card>
      )}
      <DataTable
        {...table}
        empty={
          error ? (
            <EmptyState
              title="Không tải được dữ liệu"
              description="Vui lòng kiểm tra kết nối rồi thử lại."
              action={
                onRetry && (
                  <Button variant="secondary" onClick={onRetry}>
                    Thử lại
                  </Button>
                )
              }
            />
          ) : (
            empty
          )
        }
      />
      {children}
    </>
  )
}
